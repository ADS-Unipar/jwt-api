const { Router } = require('express');
const router = Router();

const userController = require('./user.controller');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

// Todas as rotas de usuário (atendentes) são exclusivas do administrador.
router.use(authMiddleware, isAdmin);

router.get('/', userController.findAll);
router.post('/', userController.create);
router.get('/email/:email', userController.findByEmail);
router.get('/:id', userController.findById);
router.put('/:id', userController.update);
router.patch('/:id/active', userController.setActive);

module.exports = router;
