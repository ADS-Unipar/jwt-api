const sequelize = require('sequelize');

const db = new sequelize( {
    dialect: 'sqlite',
    storage: './database.sqlite',
    // A transação já começa com a trava de escrita. Sem isso, duas transações que
    // leem e depois escrevem ao mesmo tempo terminam em "database is locked".
    transactionType: 'IMMEDIATE'
});

module.exports = db;
