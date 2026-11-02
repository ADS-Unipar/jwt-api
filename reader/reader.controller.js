const readerService = require('./reader.service');
const foundOr404 = require('../utils/foundOr404');

const NOT_FOUND = 'Leitor não encontrado';

const readerController = {
    create: async (req, res) => {
        res.status(201).json(await readerService.create(req.body));
    },
    findAll: async (req, res) => {
        res.json(await readerService.findAll(req.query));
    },
    findById: async (req, res) => {
        res.json(foundOr404(await readerService.findById(req.params.id), NOT_FOUND));
    },
    update: async (req, res) => {
        res.json(foundOr404(await readerService.update(req.params.id, req.body), NOT_FOUND));
    }
};

module.exports = readerController;
