const userService = require("./user.service");
const foundOr404 = require('../utils/foundOr404');

const NOT_FOUND = 'Usuário não encontrado';

const userController = {
    create: async (req, res) => {
        const user = await userService.create(req.body);
        res.status(201).json(user);
    },
    findById: async (req, res) => {
        res.json(foundOr404(await userService.findById(req.params.id), NOT_FOUND));
    },
    findByEmail: async (req, res) => {
        res.json(foundOr404(await userService.findByEmail(req.params.email), NOT_FOUND));
    },
    findAll: async (req, res) => {
        res.json(await userService.findAll());
    },
    update: async (req, res) => {
        res.json(foundOr404(await userService.update(req.params.id, req.body, req.user.id), NOT_FOUND));
    },
    setActive: async (req, res) => {
        res.json(foundOr404(await userService.setActive(req.params.id, req.body?.active, req.user.id), NOT_FOUND));
    }
};

module.exports = userController;
