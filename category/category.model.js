const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Category = db.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: { msg: 'O nome da categoria é obrigatório.' } }
    },
    description: {
        type: DataTypes.TEXT
    }
});

module.exports = Category;
