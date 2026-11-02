const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Author = db.define('Author', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'O nome do autor é obrigatório' },
            notEmpty: { msg: 'O nome do autor é obrigatório' }
        }
    },
    nationality: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: { msg: 'Data de nascimento inválida' }
        }
    }
});

module.exports = Author;
