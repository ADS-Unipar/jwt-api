const db = require('../config/db');

// Tabela de junção N:N entre Book e Author.
// As colunas BookId e AuthorId são criadas pelo belongsToMany em models/index.js.
const BookAuthor = db.define('BookAuthor', {}, { timestamps: false });

module.exports = BookAuthor;
