'use strict';

const crypto = require('crypto');

const db = require('./db');

/**
 * Query the database and check whether the username exists and the password
 * hashes to the correct value.
 * If so, return an object with full user information.
 * @param {string} username user's email
 * @param {string} password 
 * @returns {Promise} a Promise that resolves to the full information about the current user, if the password matches
 * @throws the Promise rejects if any errors are encountered
 */
function getUser(username, password) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email=?';
        db.get(sql, [username], (err, row) => {
            if (err) { // database error
                reject(err);
            } else {
                if (!row) { // non-existent user
                    reject('Invalid username and/or password');
                } else {
                    // 32 is the hash length
                    crypto.scrypt(password, row.salt, 32, (err, computed_hash) => {
                        if (err) { // key derivation fails
                            reject(err);
                        } else {
                            const equal = crypto.timingSafeEqual(computed_hash, Buffer.from(row.password, 'hex'));
                            if (equal) { // password ok
                                resolve(row);
                            } else { // password doesn't match
                                reject('Invalid username and/or password');
                            }
                        }
                    });
                }
            }
        });
    });
}

function getUserInfo(userID) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT email FROM users WHERE id = ?';
        db.get(sql, [userID], (err, row) => {
            if (err) { // database error
                reject(err);
            } else {
                resolve(row.email);
            }
        });
    });
}

function getAllAuthorsEmail() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users';
        db.all(sql, (err, rows) => {
            if (err) { // database error
                reject(err);
            } else {
                const users = rows.map((e) => {
                    return e.email;
                })
                resolve(users);
            }
        });
    });
}

function getAuthorID(email) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id FROM users WHERE email=?';
        db.get(sql, email, (err, row) => {
            if (err) { // database error
                reject(err);
            } else {
                resolve(row.id);
            }
        });
    });
}

exports.getUser = getUser;
exports.getUserInfo = getUserInfo;
exports.getAllAuthorsEmail = getAllAuthorsEmail;
exports.getAuthorID = getAuthorID;
