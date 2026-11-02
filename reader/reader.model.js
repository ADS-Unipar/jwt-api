const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Reader = db.define('Reader', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'O nome do leitor é obrigatório' },
            notEmpty: { msg: 'O nome do leitor é obrigatório' }
        }
    },
    cpf: {
        type: DataTypes.STRING(11),
        allowNull: false,
        unique: true,
        // Guarda só os dígitos: "123.456.789-00" e "12345678900" são o mesmo CPF.
        set(value) {
            this.setDataValue('cpf', String(value ?? '').replace(/\D/g, ''));
        },
        validate: {
            notNull: { msg: 'O CPF é obrigatório' },
            is: { args: /^\d{11}$/, msg: 'O CPF deve ter 11 dígitos' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: { msg: 'E-mail inválido' }
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Reader;
