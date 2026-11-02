const User = require('../user/user.model');
const RefreshToken = require('../auth/refreshToken.model');
const Category = require('../category/category.model');
const Author = require('../author/author.model');
const Book = require('../book/book.model');
const BookAuthor = require('../book/bookAuthor.model');
const Reader = require('../reader/reader.model');
const Loan = require('../loan/loan.model');

// As associações ficam aqui, num lugar só, para os models não precisarem se
// importar entre si (o que criaria dependência circular).
//
// onDelete RESTRICT: o banco recusa excluir o "pai" enquanto houver filhos. É a
// última barreira da regra 6; os services respondem 409 com a mensagem clara.

// Category 1:N Book
Category.hasMany(Book, {
    as: 'books',
    foreignKey: { name: 'categoryId', allowNull: false },
    onDelete: 'RESTRICT'
});
Book.belongsTo(Category, {
    as: 'category',
    foreignKey: { name: 'categoryId', allowNull: false },
    onDelete: 'RESTRICT'
});

// Book N:N Author, pela tabela BookAuthor
Book.belongsToMany(Author, {
    through: BookAuthor,
    as: 'authors',
    foreignKey: 'bookId',
    otherKey: 'authorId'
});
Author.belongsToMany(Book, {
    through: BookAuthor,
    as: 'books',
    foreignKey: 'authorId',
    otherKey: 'bookId'
});

// Book 1:N Loan
Book.hasMany(Loan, {
    as: 'loans',
    foreignKey: { name: 'bookId', allowNull: false },
    onDelete: 'RESTRICT'
});
Loan.belongsTo(Book, {
    as: 'book',
    foreignKey: { name: 'bookId', allowNull: false },
    onDelete: 'RESTRICT'
});

// Reader 1:N Loan
Reader.hasMany(Loan, {
    as: 'loans',
    foreignKey: { name: 'readerId', allowNull: false },
    onDelete: 'RESTRICT'
});
Loan.belongsTo(Reader, {
    as: 'reader',
    foreignKey: { name: 'readerId', allowNull: false },
    onDelete: 'RESTRICT'
});

// User 1:N Loan (o atendente que registrou o empréstimo)
User.hasMany(Loan, {
    as: 'loans',
    foreignKey: { name: 'userId', allowNull: false },
    onDelete: 'RESTRICT'
});
Loan.belongsTo(User, {
    as: 'user',
    foreignKey: { name: 'userId', allowNull: false },
    onDelete: 'RESTRICT'
});

// User 1:N RefreshToken (o token não faz sentido sem o usuário)
User.hasMany(RefreshToken, {
    as: 'refreshTokens',
    foreignKey: { name: 'userId', allowNull: false },
    onDelete: 'CASCADE'
});
RefreshToken.belongsTo(User, {
    as: 'user',
    foreignKey: { name: 'userId', allowNull: false },
    onDelete: 'CASCADE'
});

module.exports = {
    User,
    RefreshToken,
    Category,
    Author,
    Book,
    BookAuthor,
    Reader,
    Loan
};
