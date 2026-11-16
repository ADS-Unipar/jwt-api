const categoryService = require('./category.service');

const categoryController = {
    findAll: async (req, res) => res.json(await categoryService.findAll(req.query)),
    findById: async (req, res) => res.json(await categoryService.findById(req.params.id)),
    create: async (req, res) => res.status(201).json(await categoryService.create(req.body)),
    update: async (req, res) => res.json(await categoryService.update(req.params.id, req.body)),
    remove: async (req, res) => {
        await categoryService.remove(req.params.id);
        res.status(204).end();
    }
};

module.exports = categoryController;
