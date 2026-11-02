const { Router } = require('express');
const router = Router();

const categoryController = require('./category.controller');
const authMiddleware = require('../auth/auth.middleware');
const isAdmin = require('../auth/isAdmin.middleware');

router.use(authMiddleware);

router.get('/', categoryController.findAll);
router.get('/:id', categoryController.findById);
router.post('/', isAdmin, categoryController.create);
router.put('/:id', isAdmin, categoryController.update);
router.delete('/:id', isAdmin, categoryController.remove);

module.exports = router;
