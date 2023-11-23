'use strict'

const APIURL = 'http://localhost:3000/api';

const getPublishedPages = async () => {
    try {
        const response = await fetch(APIURL + '/home');
        if (response.ok) {
            const published = await response.json();
            return published;
        } else {
            // if response is not OK
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const getAllPages = async () => {
    try {
        const response = await fetch(APIURL + '/pages', {
            credentials: 'include'
        });
        if (response.ok) {
            const pages = await response.json();
            return pages;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const deletePage = async (id) => {
    try {
        const response = await fetch(APIURL + `/${id}/delete`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const getPageContent = async (pageId) => {
    try {
        const response = await fetch(APIURL + `/pages/${pageId}`);
        if (response.ok) {
            const contents = await response.json();
            return contents;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const getPageInfo = async (pageId) => {
    try {
        const response = await fetch(APIURL + `/pageinfo/${pageId}`);
        if (response.ok) {
            const contents = await response.json();
            return contents;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const getAuthorInfo = async (authorId) => {
    try {
        const response = await fetch(APIURL + `/authors/${authorId}`);
        if (response.ok) {
            const contents = await response.json();
            return contents;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

async function doLogin(username, password) {
    try {
        const response = await fetch(APIURL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        if (response.ok) {
            return await response.json();
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error });
    }
}

const doLogout = async () => {
    try {
        const response = await fetch(APIURL + '/logout', {
            method: 'POST',
            credentials: 'include'
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error });
    }
}

const increasePosition = async (contentId) => {
    try {
        const response = await fetch(APIURL + `/increase/${contentId}`, {
            method: 'PUT',
            credentials: 'include'
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const decreasePosition = async (contentId) => {
    try {
        const response = await fetch(APIURL + `/decrease/${contentId}`, {
            method:'PUT',
            credentials: 'include'
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const editContentValue = async (pageId, contentId, value) => {
    try {
        const response = await fetch(APIURL + `/pages/${pageId}/editContent/${contentId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value: value
            })
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const deleteContent = async (pageId, contentId) => {
    try {
        const response = await fetch(APIURL + `/pages/${pageId}/deleteContent/${contentId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const editPageInfo = async (pageId, publicationDate, title) => {
    try {
        const response = await fetch(APIURL + `/pages/${pageId}/edit`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicationDate: publicationDate,
                title: title,
            })
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const editPageInfoAdmin = async (pageId, publicationDate, title, email) => {
    try {
        const response = await fetch(APIURL + `/pages/${pageId}/edit`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicationDate: publicationDate,
                title: title,
                email: email
            })
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}


const addNewBlock = async (pageId, content) => {
    try {
        const response = await fetch(APIURL + `/pages/${pageId}/addContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                content: content
            })
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error });
    }   
}

const addNewPage = async (title, publicationDate, content) => {
    try {
        const response = await fetch(APIURL + '/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                title: title,
                publicationDate: publicationDate,
                content: content
            })
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error });
    }   
}

const getWebName = async () => {
    try {
        const response = await fetch(APIURL + `/webname`);
        if (response.ok) {
            const contents = await response.json();
            return contents;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const editWebname = async (new_name) => {
    try {
        const response = await fetch(APIURL + `/editWebname`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: new_name
            })
        });
        if (response.ok) {
            return true;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}

const getAllEmails = async () => {
    try {
        const response = await fetch(APIURL + `/allAuthors`,
        {
            credentials: 'include'
        });
        if (response.ok) {
            const contents = await response.json();
            return contents;
        } else {
            const message = await response.text();
            throw new Error(response.statusText + " " + message);
        }
    } catch (error) {
        throw new Error(error.message, { cause: error })
    }
}


export { editPageInfoAdmin, getAllEmails, addNewBlock, getWebName, editWebname, getPublishedPages, getAllPages, deletePage, getPageContent, getPageInfo, getAuthorInfo, doLogout, doLogin, decreasePosition, increasePosition, editContentValue, deleteContent, editPageInfo, addNewPage };