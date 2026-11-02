// Usar sempre depois do authMiddleware, que é quem preenche req.user.
// 401 = não sei quem você é. 403 = sei quem você é, mas você não tem permissão.
const isAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    next();
};

module.exports = isAdmin;
