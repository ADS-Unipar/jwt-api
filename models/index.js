// Centraliza os modelos e as associações entre eles.
const db = require('../config/db');
const User = require('../user/user.model');
const RefreshToken = require('../auth/refreshToken.model');
const Category = require('../category/category.model');
const Author = require('../author/author.model');
const Book = require('../book/book.model');
const BookAuthor = require('../book/bookAuthor.model');
const Reader = require('../reader/reader.model');
const Loan = require('../loan/loan.model');

// User 1:N RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Category 1:N Book
Category.hasMany(Book, { foreignKey: { name: 'categoryId', allowNull: false }, as: 'books', onDelete: 'RESTRICT' });
Book.belongsTo(Category, { foreignKey: { name: 'categoryId', allowNull: false }, as: 'category' });

// Book N:N Author (via BookAuthor)
Book.belongsToMany(Author, { through: BookAuthor, foreignKey: 'bookId', otherKey: 'authorId', as: 'authors' });
Author.belongsToMany(Book, { through: BookAuthor, foreignKey: 'authorId', otherKey: 'bookId', as: 'books' });

// Loan pertence a Book, Reader e User (atendente que registrou)
Book.hasMany(Loan, { foreignKey: { name: 'bookId', allowNull: false }, as: 'loans', onDelete: 'RESTRICT' });
Loan.belongsTo(Book, { foreignKey: { name: 'bookId', allowNull: false }, as: 'book' });

Reader.hasMany(Loan, { foreignKey: { name: 'readerId', allowNull: false }, as: 'loans', onDelete: 'RESTRICT' });
Loan.belongsTo(Reader, { foreignKey: { name: 'readerId', allowNull: false }, as: 'reader' });

User.hasMany(Loan, { foreignKey: { name: 'userId', allowNull: false }, as: 'loans', onDelete: 'RESTRICT' });
Loan.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false }, as: 'user' });

module.exports = { db, User, RefreshToken, Category, Author, Book, BookAuthor, Reader, Loan };
