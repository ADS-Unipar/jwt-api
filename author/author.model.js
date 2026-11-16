const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Author = db.define('Author', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'O nome do autor é obrigatório.' } }
    },
    nationality: {
        type: DataTypes.STRING
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        validate: { isDate: { msg: 'Data de nascimento inválida (use AAAA-MM-DD).' } }
    }
});

module.exports = Author;
