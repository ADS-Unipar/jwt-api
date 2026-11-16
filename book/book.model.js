const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Book = db.define('Book', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'O título é obrigatório.' } }
    },
    isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: { msg: 'O ISBN é obrigatório.' } }
    },
    year: {
        type: DataTypes.INTEGER,
        validate: { isInt: { msg: 'O ano deve ser um número inteiro.' } }
    },
    totalCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: { args: [0], msg: 'totalCopies não pode ser negativo.' } }
    },
    availableCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: { args: [0], msg: 'availableCopies não pode ser negativo.' } }
    }
});

module.exports = Book;
