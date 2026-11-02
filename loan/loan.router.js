const { Router } = require('express');
const router = Router();

const loanController = require('./loan.controller');
const authMiddleware = require('../auth/auth.middleware');

router.use(authMiddleware);

router.get('/', loanController.findAll);
router.post('/', loanController.create);
router.patch('/:id/return', loanController.returnLoan);

module.exports = router;
