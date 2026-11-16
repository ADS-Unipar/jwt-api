const loanService = require('./loan.service');

const loanController = {
    findAll: async (req, res) => res.json(await loanService.findAll(req.query)),
    findById: async (req, res) => res.json(await loanService.findById(req.params.id)),
    create: async (req, res) => res.status(201).json(await loanService.create(req.body, req.user.id)),
    returnLoan: async (req, res) => res.json(await loanService.returnLoan(req.params.id))
};

module.exports = loanController;
