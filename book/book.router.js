const { Router } = require('express');
const router = Router();

const bookController = require('./book.controller');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

router.use(authMiddleware);

// GET /v1/books?title=&categoryId=&authorId=&available=true
router.get('/', bookController.findAll);
router.get('/:id', bookController.findById);
router.post('/', isAdmin, bookController.create);
router.put('/:id', isAdmin, bookController.update);
router.delete('/:id', isAdmin, bookController.remove);

module.exports = router;
