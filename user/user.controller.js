const userService = require("./user.service");
const HttpError = require('../utils/httpError');

const foundOr404 = (user) => {
    if (!user) {
        throw new HttpError(404, 'Usuário não encontrado');
    }
    return user;
};

const userController = {
    create: async (req, res) => {
        const user = await userService.create(req.body);
        res.status(201).json(user);
    },
    findById: async (req, res) => {
        res.json(foundOr404(await userService.findById(req.params.id)));
    },
    findByEmail: async (req, res) => {
        res.json(foundOr404(await userService.findByEmail(req.params.email)));
    },
    findAll: async (req, res) => {
        res.json(await userService.findAll());
    },
    update: async (req, res) => {
        res.json(foundOr404(await userService.update(req.params.id, req.body, req.user.id)));
    },
    setActive: async (req, res) => {
        res.json(foundOr404(await userService.setActive(req.params.id, req.body?.active, req.user.id)));
    }
};

module.exports = userController;
