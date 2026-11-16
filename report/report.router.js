const { Router } = require('express');
const router = Router();

const reportService = require('./report.service');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

router.use(authMiddleware, isAdmin);

router.get('/dashboard', async (req, res) => res.json(await reportService.dashboard()));

module.exports = router;
