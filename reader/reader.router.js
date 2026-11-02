const { Router } = require('express');
const router = Router();

const readerController = require('./reader.controller');
const authMiddleware = require('../auth/auth.middleware');

// Leitores são responsabilidade do atendente: qualquer usuário logado acessa.
router.use(authMiddleware);

router.get('/', readerController.findAll);
router.get('/:id', readerController.findById);
router.get('/:id/loans', readerController.findLoans);
router.post('/', readerController.create);
router.put('/:id', readerController.update);

module.exports = router;
