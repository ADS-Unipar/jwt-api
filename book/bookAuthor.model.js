const db = require('../config/db');

// Tabela de junção do N:N entre Book e Author.
// As colunas bookId e authorId são criadas pelo belongsToMany em models/index.js.
const BookAuthor = db.define('BookAuthor', {});

module.exports = BookAuthor;
