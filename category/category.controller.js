const categoryService = require('./category.service');
const foundOr404 = require('../utils/foundOr404');

const NOT_FOUND = 'Categoria não encontrada';

const categoryController = {
    create: async (req, res) => {
        res.status(201).json(await categoryService.create(req.body));
    },
    findAll: async (req, res) => {
        res.json(await categoryService.findAll());
    },
    findById: async (req, res) => {
        res.json(foundOr404(await categoryService.findById(req.params.id), NOT_FOUND));
    },
    update: async (req, res) => {
        res.json(foundOr404(await categoryService.update(req.params.id, req.body), NOT_FOUND));
    },
    remove: async (req, res) => {
        foundOr404(await categoryService.remove(req.params.id), NOT_FOUND);
        res.status(204).send();
    }
};

module.exports = categoryController;
