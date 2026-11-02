const { Router } = require('express');
const router = Router();

const reportController = require('./report.controller');
const authMiddleware = require('../auth/auth.middleware');
const isAdmin = require('../auth/isAdmin.middleware');

router.use(authMiddleware, isAdmin);

router.get('/dashboard', reportController.dashboard);

module.exports = router;
