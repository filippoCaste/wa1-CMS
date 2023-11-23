'use strict';

const dayjs = require('dayjs');
const { Page, Content } = require('../model/model');
const db = require('./db');

function listPages() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM pages';
        db.all(sql, (err, rows) => {
            if (err) { // database error
                reject(err);
            } else {
                const pages = rows.map((page) => {
                    return new Page(page.pageID, page.title, page.authorID, dayjs(page.creationDate), page.publicationDate ? dayjs(page.publicationDate) : null);
                })
                resolve(pages);
            }
        });
    });
}

function getPageInfo(pageID) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM pages WHERE pageID = ?';
        db.get(sql, [pageID], (err, row) => {
            if (err) { // database error
                reject(err);
            } else {
                const page = new Page(row.pageID, row.title, row.authorID, dayjs(row.creationDate), row.publicationDate ? dayjs(row.publicationDate) : null);
                resolve(page);
            }
        });
    });
}

function insertNewPage(title, publicationDate, authorID) {

    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO pages(title, authorID, creationDate, publicationDate) VALUES (?,?,?,?);';
        db.run(sql, [title, authorID, dayjs().format("YYYY-MM-DD"), publicationDate], (err) => {
            if (err) { // database error
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

function editPage(pageID, changeObj) {

    return new Promise((resolve, reject) => {
        const sql = `UPDATE pages SET ${changeObj.title ? 'title=?' : ''} ${changeObj.title && changeObj.publicationDate ? ', ' : ''} ${changeObj.publicationDate ? 'publicationDate=? ' : ''} WHERE pageID=?`;
        let array = []
        changeObj.title && (array = [...array, changeObj.title])
        changeObj.publicationDate && (array = [...array, changeObj.publicationDate])
        db.run(sql, [...array, pageID], (err) => {
            if(err) {
                reject(err);
            } else {
                resolve(true)
            }
        })
    })
}

function editOwnership(pageID, newAuthorID) {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE pages SET authorID=? WHERE pageID=?`;
        db.run(sql, [newAuthorID, pageID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true)
            }
        })
    })
}

function deletePage(pageID) {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM pages WHERE pageID=? ";
        db.run(sql, pageID, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true)
            }
        })
    })
}

/**
 * Insert the content into an existing page.
 * @param {*} pageID 
 * @param {Array} content contains all the content added @ creation time
 * @returns 
 */
function insertContent(pageID, content) {
    return new Promise((resolve, reject) => {
        const max_sql = 'SELECT MAX(level) AS max_level FROM contents WHERE pageID=?'
        const sql = "INSERT INTO contents(pageID, type, value, level) VALUES (?,?,?,?)";
        let max = -1;

        for(let c of content) {
            db.get(max_sql, pageID, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if(row.max_level) {
                        max = parseInt(row.max_level) + 1
                    } else {
                        max += 1;
                    }
                    db.run(sql, [pageID, c.type, c.value, max], (err) => {
                        if (err) {
                            reject(err);
                        }
                    })
                }
            })
        }
        resolve(true);
    })
}

function getPageID(authorID, title) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT pageID FROM pages WHERE authorID=? AND title=? ";
        db.get(sql, [authorID, title], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.pageID)
            }
        })
    })
}

function deleteContent(pageID) {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM contents WHERE pageID=? ";
        db.run(sql, pageID, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true)
            }
        })
    })
}

function editContent(pageID, content) {
    return new Promise((resolve, reject) => {
        // type cannot be changed...
        for (let c of content) {
            let array = [];
            let sql = `UPDATE contents SET ${c.value ? 'value=?' : ''} ${c.value && c.order ? ', ' : ''} ${c.order ? 'level=? ' : ''} WHERE pageID=? AND contentID=?`;
            c.value && (array = [...array, c.value])
            c.order && (array = [...array, c.order])
            db.run(sql, [...array, pageID, c.cid], (err) => {
                if (err) {
                    reject(err);
                }
            })
        }
        resolve(true);
    })
}

function getContentOfPage(pageID) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM contents WHERE pageID=? ";
        db.all(sql, [pageID], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const content = rows.map(row => new Content(row.contentID, row.pageID, row.type, row.value, row.level))
                resolve(content)
            }
        })
    })
}

/**
 * Increase means one step up. Closer to the top.
 * @param {*} contentID 
 * @returns 
 */
function increasePosition(contentID) {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE contents SET level=level-1 WHERE contentID = ?";
        db.run(sql, [contentID], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(true)
            }
        })
    })
}

function decreasePosition(contentID) {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE contents SET level=level+1 WHERE contentID = ?";
        db.run(sql, [contentID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true)
            }
        })
    })
}

function editContentValue (pageID, contentID, value) {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE contents SET value=? WHERE contentID = ? AND pageID=?";
        db.run(sql, [value, contentID, pageID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true)
            }
        })
    })
}

function deleteContentById(pageID, contentID) {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM contents WHERE pageID=? AND contentID = ? ";
        db.run(sql, [pageID, contentID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true)
            }
        })
    })
}

function getCMSmallName() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM CMSWebname LIMIT 1; ";
        db.get(sql, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.name)
            }
        })
    })
}

function editWebname(new_name) {

    return new Promise((resolve, reject) => {
        const sql = `UPDATE CMSWebname SET name=?`;
        db.run(sql, [new_name], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true)
            }
        })
    })
}

exports.listPages = listPages;
exports.getPageInfo = getPageInfo;
exports.insertNewPage = insertNewPage;
exports.editPage = editPage;
exports.deletePage = deletePage;
exports.editOwnership = editOwnership;
exports.insertContent = insertContent;
exports.getPageID = getPageID;
exports.deleteContent = deleteContent;
exports.editContent = editContent;
exports.getContentOfPage = getContentOfPage;
exports.increasePosition = increasePosition;
exports.decreasePosition = decreasePosition;
exports.editContentValue = editContentValue;
exports.deleteContentById = deleteContentById;
exports.getCMSmallName = getCMSmallName;
exports.editWebname = editWebname;
