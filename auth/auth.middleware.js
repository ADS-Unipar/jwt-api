const authService = require('./auth.service');

// Exige um access token válido. Responde 401 (e não 400) para que o front
// saiba que deve tentar renovar o token via /auth/refresh.
const authMiddleware = (req, res, next) => {
    const header = req.header('Authorization') || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Acesso negado. Token não informado.' });
    }

    try {
        req.user = authService.verifyAccessToken(token);
        next();
    } catch (error) {
        const message = error.name === 'TokenExpiredError' ? 'Token expirado.' : 'Token inválido.';
        res.status(401).json({ error: message });
    }
};

// Deve ser usado depois do authMiddleware.
const isAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    }
    next();
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.isAdmin = isAdmin;
