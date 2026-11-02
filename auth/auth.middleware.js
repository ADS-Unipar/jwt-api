const authService = require("./auth.service");

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado: token não informado' });
    }

    try {
        const decoded = await authService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        // Tem que ser 401: é esse código que faz o front tentar renovar o token.
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

module.exports = authMiddleware;
