const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Reader = db.define('Reader', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'O nome do leitor é obrigatório.' } }
    },
    cpf: {
        type: DataTypes.STRING(11),
        allowNull: false,
        unique: true,
        validate: { is: { args: /^\d{11}$/, msg: 'CPF deve conter 11 dígitos.' } },
        // Aceita "123.456.789-00" e guarda só os dígitos.
        set(value) {
            this.setDataValue('cpf', typeof value === 'string' ? value.replace(/\D/g, '') : value);
        }
    },
    email: {
        type: DataTypes.STRING,
        validate: { isEmail: { msg: 'E-mail inválido.' } }
    },
    phone: {
        type: DataTypes.STRING
    }
});

module.exports = Reader;
