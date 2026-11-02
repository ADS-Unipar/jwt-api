const bookService = require('./book.service');
const foundOr404 = require('../utils/foundOr404');

const NOT_FOUND = 'Livro não encontrado';

const bookController = {
    create: async (req, res) => {
        res.status(201).json(await bookService.create(req.body));
    },
    findAll: async (req, res) => {
        res.json(await bookService.findAll(req.query));
    },
    findById: async (req, res) => {
        res.json(foundOr404(await bookService.findById(req.params.id), NOT_FOUND));
    },
    update: async (req, res) => {
        res.json(foundOr404(await bookService.update(req.params.id, req.body), NOT_FOUND));
    },
    remove: async (req, res) => {
        foundOr404(await bookService.remove(req.params.id), NOT_FOUND);
        res.status(204).send();
    }
};

module.exports = bookController;
