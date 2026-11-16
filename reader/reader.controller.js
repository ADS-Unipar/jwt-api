const readerService = require('./reader.service');

const readerController = {
    findAll: async (req, res) => res.json(await readerService.findAll(req.query)),
    findById: async (req, res) => res.json(await readerService.findById(req.params.id)),
    create: async (req, res) => res.status(201).json(await readerService.create(req.body)),
    update: async (req, res) => res.json(await readerService.update(req.params.id, req.body)),
    loans: async (req, res) => res.json(await readerService.loans(req.params.id, req.query))
};

module.exports = readerController;
