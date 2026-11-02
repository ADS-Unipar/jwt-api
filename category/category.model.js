const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Category = db.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'O nome da categoria é obrigatório' },
            notEmpty: { msg: 'O nome da categoria é obrigatório' }
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Category;
