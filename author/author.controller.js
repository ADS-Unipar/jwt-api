const authorService = require('./author.service');
const foundOr404 = require('../utils/foundOr404');

const NOT_FOUND = 'Autor não encontrado';

const authorController = {
    create: async (req, res) => {
        res.status(201).json(await authorService.create(req.body));
    },
    findAll: async (req, res) => {
        res.json(await authorService.findAll());
    },
    findById: async (req, res) => {
        res.json(foundOr404(await authorService.findById(req.params.id), NOT_FOUND));
    },
    update: async (req, res) => {
        res.json(foundOr404(await authorService.update(req.params.id, req.body), NOT_FOUND));
    },
    remove: async (req, res) => {
        foundOr404(await authorService.remove(req.params.id), NOT_FOUND);
        res.status(204).send();
    }
};

module.exports = authorController;
