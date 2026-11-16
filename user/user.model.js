const db = require('../config/db');
const { DataTypes } = require('sequelize');

const User = db.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'O nome é obrigatório.' } }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: { msg: 'E-mail inválido.' } }
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: { msg: 'O username é obrigatório.' } }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    // Nunca devolve o hash da senha por padrão.
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: { withPassword: { attributes: { include: ['password'] } } }
});

module.exports = User;
