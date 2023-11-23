'use strict';

const PORT = 3000;

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const dayjs = require('dayjs')

const usersDAO = require('./dao/usersDAO.js')
const dataDAO = require('./dao/dataDAO.js')

const app = express();

// Configure and register middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.static('public'));

// LOGIN
const passport = require('passport');
const LocalStrategy = require('passport-local');

app.use(session({
    secret: 'unsecret secret', resave: false, saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username, password, callback) => {
    usersDAO.getUser(username, password).then((user) => {
        callback(null, user);
    }).catch((err) => {
        callback(null, false, err)
    });
}));

passport.serializeUser((user, callback) => {
    // req.user will contain email, id, role
    callback(null, { id: user.id, email: user.email, role: user.role });
});

passport.deserializeUser((user, callback) => {
    callback(null, { id: user.id, email: user.email, role: user.role });
});

app.use(passport.authenticate('session'))

const isLoggedCreator = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        console.log("UNAUTHORIZED")
        res.status(401).send("Unauthorized");
    }
}

//-------------------------------------------------------------------------------
//                                PUBLIC ROUTES
//-------------------------------------------------------------------------------
app.get('/api/home', (req, res) => {
    dataDAO.listPages().then((result) => {
        result = result
            .filter((p) => dayjs(p.publicationDate).isBefore(dayjs()))
            .sort((p1, p2) => p1.publicationDate.isBefore(p2.publicationDate) )
        res.json(result);
    }).catch((error) => {
        res.status(500).send(error.message);
    });
})

app.post('/api/login', function(req, res, next) {
    // if fails, then means that user is not authenticated and the server returns error 401
    // from the LocalStrategy code
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            // display wrong login messages
            return res.status(401).json({ error: info });
        }
        // success, perform the login and extablish a login session
        req.login(user, (err) => {
            if (err)
                return next(err);

            // req.user contains the authenticated user, we send all the user info back
            // this is coming from usersDAO.getUser() in LocalStrategy
            return res.json(req.user);
        });
    })(req, res, next);

});

app.get('/api/pages/:pageId', (req, res) => {
    dataDAO.getContentOfPage(req.params.pageId).then((result) => {
        res.json(result);
    }).catch(err => res.status(500).send(err.message))
})

app.get('/api/pageinfo/:pageId', (req, res) => {
    dataDAO.getPageInfo(req.params.pageId).then((result) => {
        res.json(result);
    }).catch(err => res.status(500).send(err.message))
})

app.get('/api/authors/:authorId', (req, res) => {
    usersDAO.getUserInfo(req.params.authorId).then((result) => {
        res.json(result);
    }).catch(err => res.status(500).send(err.message))
})

app.post('/api/logout', (req, res) => {
    try {
        req.logout(()=> res.status(200).end());
    } catch (err) {
        res.status(500).send("Logout procedure failed");
    }
})

app.get('/api/webname', (req,res) => {
    dataDAO.getCMSmallName()
        .then((result) => res.json(result))
        .catch(err => res.status(500).send(err.message))
})

//-------------------------------------------------------------------------------
//                          RESTRICTED ROUTES (creator)
//-------------------------------------------------------------------------------

/*
    BEWARE THAT ADMIN CAN ALSO ACCESS AS CREATOR -- can do same things too
*/
app.use(isLoggedCreator)
/**
 * accessible after authentication --> here are shown all pages (even if not published)
 */
app.get('/api/pages', (req, res) => {
    dataDAO.listPages().then((result) => {
        res.json(result);
    }).catch((err) => res.status(500).send(err.message))
})

app.post('/api/create', async (req, res) => {
    // page info
    let {title, publicationDate} = req.body;
    
    // page content
    // could be an object containing an array of objects that can be
    //  - {"type":"header", "value":"An header"}
    //  - {"type":"image", "value":"cat.jpeg"}
    //  - {"type":"paragraph", "value":"Some text"}

    const contentArray = req.body.content;
    // input validation server side
    if(contentArray.length <= 1) {
        return res.status(400).send("Some content misses.")
    }
    let valid1 = false;
    let valid2 = false;
    for(let c of contentArray) {
        if(c.type === "header") {
            valid1 = true;
        }
        if(c.type === "header" || c.type === "paragraph") {
            valid2 = true;
        }
    }

    if(!valid1 || !valid2) {
        return res.status(400).send("Some content misses.")
    }

    if (title) {
        title = title.trim();
    }

    if (publicationDate) {
        publicationDate = publicationDate.trim();
    }

    if (isEmptyParam([publicationDate, title])) {
        return res.status(400).send('Cannot input empty parameters');
    }

    if (publicationDate && !validDate(publicationDate)) {
        return res.status(400).send('Invalid date format');
    }

    dataDAO.listPages()
        .then((result) => {
            for (let page of result) {
                if (page.title === title && page.authorID === req.user.id) {
                    throw new Error("Cannot create two pages with the same title.");
                }
            }})
        .then (() => dataDAO.insertNewPage(title, publicationDate, req.user.id) )
        .then(() => {
            dataDAO.getPageID(req.user.id, title)
                .then((result) => {
                    dataDAO.insertContent(result, contentArray)
                        .then(() => res.end())
                        .catch(err => res.status(500).send(err.message));
                })
                .catch(err => res.status(500).send(err.message));
        })
        .catch((err) => res.status(500).send(err.message))

})

app.put('/api/pages/:pageId/edit', async (req, res) => {
    let {publicationDate, title} = req.body;
    const pageID = req.params.pageId;

    let changeObj = {};
    if (publicationDate) {
        publicationDate = publicationDate.trim();
        if(publicationDate === 'NULL' || validDate(publicationDate)) {
            changeObj.publicationDate = publicationDate;
        } else {
            return res.status(400).send('Invalid date format');
        }
    }

    if(title) {
        title = title.trim();
        changeObj.title = title;
    }
    
    if(isEmptyParam([publicationDate, title])) {
        return res.status(400).send('Cannot input empty parameters');
    }

    if(req.user.role === "creator"){
        // CREATOR
        const page = await dataDAO.getPageInfo(pageID);
        if(page.authorID !== req.user.id) {
            return res.status(401).send("You cannot modify a page you did not create!")
        } else {
            if (changeObj.title) {
                let result = await dataDAO.listPages();
                for (let page of result) {
                    if (page.title === changeObj.title && page.authorID === req.user.id) {
                        return res.status(400).send("Cannot create two pages with the same title.")
                    }
                }
            }

            dataDAO.editPage(pageID, changeObj)
                .then(() => res.end())
                .catch(err => res.status(500).send(err.message));
        }
    } else if (req.user.role === "admin") {
        // ADMIN 
        let newAuthorEmail = req.body.email;
        let newAuthorID = await usersDAO.getAuthorID(newAuthorEmail);

        if (changeObj.title) {
            let result = await dataDAO.listPages();
            for (let page of result) {
                if (page.title === changeObj.title && page.authorID === newAuthorID) {
                    return res.status(400).send("Cannot create two pages with the same title.")
                }
            }
        }

        dataDAO.editPage(pageID, changeObj)
            .then(() => {
                if (newAuthorID) {
                    dataDAO.editOwnership(pageID, newAuthorID)
                        .then(() => res.end())
                        .catch(err => res.status(500).send(err.message))
                }
                res.end();
            })
            .catch(err => res.status(500).send(err.message))

    }
})

app.delete('/api/:pageId/delete', async (req, res) => {
    const pageID = req.params.pageId;
    if (req.user.role === "creator") {
        // CREATOR
        const page = await dataDAO.getPageInfo(pageID);
        if (page.authorID !== req.user.id) {
            return res.status(401).send("You cannot delete a page you did not create!")
        } else {
            dataDAO.deletePage(pageID)
                .then(() => {
                    dataDAO.deleteContent(pageID)
                        .then(() => res.end())
                        .catch(err => res.status(500).send(err.message));
                })
                .catch(err => res.status(500).send(err.message));
        }
    } else if (req.user.role === "admin") {
        // ADMIN 
        dataDAO.deletePage(pageID)
            .then(() => {
                dataDAO.deleteContent(pageID)
                    .then(() => res.end())
                    .catch(err => res.status(500).send(err.message));
            })
            .catch(err => res.status(500).send(err.message));
    }
})

app.put('/api/increase/:contentId', async (req, res) => {
    dataDAO.increasePosition(req.params.contentId)
     .then(() => res.status(200).end())
     .catch(err => res.status(500).send(err.message));
})

app.put('/api/decrease/:contentId', async (req, res) => {
    dataDAO.decreasePosition(req.params.contentId)
        .then(() => res.status(200).end())
        .catch(err => res.status(500).send(err.message));
})

app.put('/api/pages/:pageId/editContent/:contentId', async (req,res) => {
    dataDAO.editContentValue(req.params.pageId, req.params.contentId, req.body.value)
        .then(() => res.end())
        .catch(err => res.status(500).send(err.message));
})

app.delete('/api/pages/:pageId/deleteContent/:contentId', async (req, res) => {
    dataDAO.deleteContentById(req.params.pageId, req.params.contentId, req.body.value)
        .then(() => res.end())
        .catch(err => res.status(500).send(err.message));
})

app.post('/api/pages/:pageId/addContent', async (req,res) => {
    dataDAO.insertContent(req.params.pageId, req.body.content)
        .then(() => res.status(200).end())
        .catch(err => res.status(500).send(err.message));
})

app.put('/api/editWebname', async (req,res) => {
    dataDAO.editWebname(req.body.name)
        .then(() => res.end())
        .catch(err => res.status(500).send(err.message));
})

app.get('/api/allAuthors', async (req,res) => {
    req.user.role==="admin" ? usersDAO.getAllAuthorsEmail()
        .then((result) => res.json(result))
        .catch(err => res.status(500).send(err.message))
        :
        res.status(401).send("Unauthorized")
})

app.listen(PORT,
    () => { console.log(`Server started on http://localhost:${PORT}/`) });

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

/**
 * Check whether the date provided is a valid date.
 * @param {*} date
    * @returns true if it is a valid date.Otherwise, false.
 */
function validDate(date) {
    if (!date.match(/[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}/)) {
        return false;
    } else {
        let [yyyy, mm, dd] = date.split('-');
        yyyy = parseInt(yyyy);
        mm = parseInt(mm);
        dd = parseInt(dd);
        const ily = !(yyyy & 3 || !(yyyy % 25) && yyyy & 15);
        if (mm > 12 || mm < 0 || dd > 31 || dd < 0 || yyyy < 0) {
            return false;
        } else {
            if (mm === 2) {
                if ((ily && dd > 29) || (!ily && dd > 28))
                    return false;
            }
            if (mm === 4 || mm === 6 || mm === 9 || mm === 11) {
                if (dd > 30)
                    return false;
            }
        }
    }
    return true;
};

function isEmptyParam(inputs) {
    for (let inp of inputs) {
        if (inp && inp.toString() === "") {
            return true;
        }
    }
    return false;
}