const { Op } = require('sequelize');
const { Reader } = require('../models');
const loanService = require('../loan/loan.service');
const { notFound } = require('../utils/httpError');

const pick = ({ name, cpf, email, phone } = {}) =>
    Object.fromEntries(Object.entries({ name, cpf, email, phone }).filter(([, v]) => v !== undefined));

const readerService = {
    // GET /v1/readers?search= (nome ou CPF)
    findAll: ({ search } = {}) => {
        let where;
        if (search) {
            const digits = search.replace(/\D/g, '');
            where = { [Op.or]: [{ name: { [Op.like]: `%${search}%` } }] };
            if (digits) where[Op.or].push({ cpf: { [Op.like]: `%${digits}%` } });
        }
        return Reader.findAll({ where, order: [['name', 'ASC']] });
    },

    findById: async (id) => {
        const reader = await Reader.findByPk(id);
        if (!reader) throw notFound('Leitor não encontrado.');
        return reader;
    },

    create: (data) => Reader.create(pick(data)),

    update: async (id, data) => {
        const reader = await readerService.findById(id);
        return reader.update(pick(data));
    },

    loans: async (id, query = {}) => {
        await readerService.findById(id);
        return loanService.findAll({ ...query, readerId: id });
    }
};

module.exports = readerService;
