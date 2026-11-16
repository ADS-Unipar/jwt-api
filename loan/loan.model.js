const db = require('../config/db');
const { DataTypes } = require('sequelize');

const LOAN_STATUS = Object.freeze({
    ATIVO: 'ATIVO',
    ATRASADO: 'ATRASADO',
    DEVOLVIDO: 'DEVOLVIDO'
});

const Loan = db.define('Loan', {
    loanDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    returnDate: {
        type: DataTypes.DATEONLY
    },
    status: {
        type: DataTypes.ENUM(...Object.values(LOAN_STATUS)),
        allowNull: false,
        defaultValue: LOAN_STATUS.ATIVO
    },
    fine: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        get() {
            const v = this.getDataValue('fine');
            return v === null || v === undefined ? v : Number(v);
        }
    }
});

module.exports = Loan;
module.exports.LOAN_STATUS = LOAN_STATUS;
