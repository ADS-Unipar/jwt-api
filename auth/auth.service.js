const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { db, User, RefreshToken } = require('../models');
const { unauthorized, badRequest } = require('../utils/httpError');

const ACCESS_TOKEN_EXPIRES = () => process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_TOKEN_DAYS = () => Number(process.env.REFRESH_TOKEN_DAYS || 7);

const publicUser = (user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    active: user.active
});

const signAccessToken = (user) => jwt.sign(
    { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES() }
);

// Gera um refresh token (JWT com jti aleatório) e o persiste na tabela RefreshToken.
const issueRefreshToken = async (user, transaction) => {
    const days = REFRESH_TOKEN_DAYS();
    const token = jwt.sign(
        { id: user.id, jti: crypto.randomBytes(16).toString('hex') },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: `${days}d` }
    );
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ token, userId: user.id, expiresAt }, { transaction });
    return token;
};

const revokeAllForUser = (userId, transaction) =>
    RefreshToken.update({ revoked: true }, { where: { userId, revoked: false }, transaction });

const authService = {
    login: async (email, password) => {
        if (!email || !password) throw badRequest('Informe e-mail e senha.');

        const user = await User.scope('withPassword').findOne({ where: { email } });
        if (!user) throw unauthorized('Invalid email or password');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw unauthorized('Invalid email or password');
        if (!user.active) throw unauthorized('Usuário desativado. Procure um administrador.');

        const accessToken = signAccessToken(user);
        const refreshToken = await issueRefreshToken(user);
        return { accessToken, refreshToken, user: publicUser(user) };
    },

    refresh: async (refreshToken) => {
        if (!refreshToken) throw badRequest('refreshToken é obrigatório.');

        try {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch {
            throw unauthorized('Refresh token inválido ou expirado.');
        }

        return db.transaction(async (transaction) => {
            const stored = await RefreshToken.findOne({ where: { token: refreshToken }, transaction });
            if (!stored) throw unauthorized('Refresh token inválido.');

            // Reuso de um token já revogado = possível roubo: derruba todas as sessões do usuário.
            if (stored.revoked) {
                await revokeAllForUser(stored.userId, transaction);
                // Lança depois do commit para a revogação em massa não sofrer rollback.
                return { reused: true };
            }

            if (stored.expiresAt < new Date()) throw unauthorized('Refresh token expirado.');

            const user = await User.findByPk(stored.userId, { transaction });
            if (!user || !user.active) {
                await stored.update({ revoked: true }, { transaction });
                return { inactive: true };
            }

            await stored.update({ revoked: true }, { transaction });
            const newRefreshToken = await issueRefreshToken(user, transaction);
            return { accessToken: signAccessToken(user), refreshToken: newRefreshToken, user: publicUser(user) };
        }).then((result) => {
            if (result.reused) throw unauthorized('Refresh token reutilizado. Todas as sessões foram encerradas.');
            if (result.inactive) throw unauthorized('Usuário desativado ou inexistente.');
            return result;
        });
    },

    logout: async (refreshToken) => {
        if (!refreshToken) throw badRequest('refreshToken é obrigatório.');
        await RefreshToken.update({ revoked: true }, { where: { token: refreshToken } });
    },

    me: async (userId) => {
        const user = await User.findByPk(userId);
        if (!user) throw unauthorized('Usuário não encontrado.');
        return publicUser(user);
    },

    verifyAccessToken: (token) => jwt.verify(token, process.env.JWT_SECRET),

    revokeAllForUser
};

module.exports = authService;
