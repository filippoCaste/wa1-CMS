'use strict';

function Page(id, title, authorID, creationDate, publicationDate) {
    this.id = id;
    this.title = title;
    this.authorID = authorID;
    this.creationDate = creationDate;
    this.publicationDate = publicationDate;
}

function Content(id, pageID, type, value, level) {
    this.id = id;
    this.pageID = pageID;
    this.type = type;
    this.value = value;
    this.level = level;
}

exports.Page = Page;
exports.Content = Content;
