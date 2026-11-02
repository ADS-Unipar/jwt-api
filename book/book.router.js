const { Router } = require('express');
const router = Router();

const bookController = require('./book.controller');
const authMiddleware = require('../auth/auth.middleware');
const isAdmin = require('../auth/isAdmin.middleware');

router.use(authMiddleware);

router.get('/', bookController.findAll);
router.get('/:id', bookController.findById);
router.post('/', isAdmin, bookController.create);
router.put('/:id', isAdmin, bookController.update);
router.delete('/:id', isAdmin, bookController.remove);

module.exports = router;
