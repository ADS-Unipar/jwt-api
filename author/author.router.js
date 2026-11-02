const { Router } = require('express');
const router = Router();

const authorController = require('./author.controller');
const authMiddleware = require('../auth/auth.middleware');
const isAdmin = require('../auth/isAdmin.middleware');

router.use(authMiddleware);

router.get('/', authorController.findAll);
router.get('/:id', authorController.findById);
router.post('/', isAdmin, authorController.create);
router.put('/:id', isAdmin, authorController.update);
router.delete('/:id', isAdmin, authorController.remove);

module.exports = router;
