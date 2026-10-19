const {Router} = require('express');
const router = Router();

const userController = require('./user.controller');
const authMiddleware = require('../auth/auth.middleware');

router.post('/', userController.create);
router.get('/:id', authMiddleware, userController.findById);
router.get('/email/:email', authMiddleware, userController.findByEmail);
router.get('/', authMiddleware, userController.findAll);

module.exports = router;