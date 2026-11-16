const authorService = require('./author.service');

const authorController = {
    findAll: async (req, res) => res.json(await authorService.findAll(req.query)),
    findById: async (req, res) => res.json(await authorService.findById(req.params.id)),
    create: async (req, res) => res.status(201).json(await authorService.create(req.body)),
    update: async (req, res) => res.json(await authorService.update(req.params.id, req.body)),
    remove: async (req, res) => {
        await authorService.remove(req.params.id);
        res.status(204).end();
    }
};

module.exports = authorController;
