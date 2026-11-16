const userService = require('./user.service');

const userController = {
    create: async (req, res) => {
        res.status(201).json(await userService.create(req.body));
    },
    update: async (req, res) => {
        res.json(await userService.update(req.params.id, req.body));
    },
    setActive: async (req, res) => {
        res.json(await userService.setActive(req.params.id, req.body?.active, req.user.id));
    },
    findById: async (req, res) => {
        res.json(await userService.findById(req.params.id));
    },
    findByEmail: async (req, res) => {
        res.json(await userService.findByEmail(req.params.email));
    },
    findAll: async (req, res) => {
        res.json(await userService.findAll());
    }
};

module.exports = userController;
