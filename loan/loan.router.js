const { Router } = require('express');
const router = Router();

const loanController = require('./loan.controller');
const { authMiddleware } = require('../auth/auth.middleware');

router.use(authMiddleware);

// GET /v1/loans?status=ATIVO|ATRASADO|DEVOLVIDO&readerId=&bookId=
router.get('/', loanController.findAll);
router.get('/:id', loanController.findById);
router.post('/', loanController.create);
router.patch('/:id/return', loanController.returnLoan);

module.exports = router;
