const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const userService = require('../user/user.service');
const RefreshToken = require('./refreshToken.model');
const HttpError = require('../utils/httpError');

const REFRESH_TOKEN_DAYS = 7;

const invalidRefreshToken = () => new HttpError(401, 'Refresh token inválido ou expirado');

// O access token é um JWT: a API confia nele só pela assinatura, sem ir ao banco.
const signAccessToken = (user) => jwt.sign({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin
}, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' });

// O refresh token é só uma string aleatória: quem diz se ele vale é a tabela
// RefreshToken. É isso que permite revogar, coisa que um JWT sozinho não permite.
const createRefreshToken = async (user, transaction) => {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ token, userId: user.id, expiresAt }, { transaction });
    return token;
};

const revokeAllFromUser = (userId) => RefreshToken.update(
    { revoked: true },
    { where: { userId, revoked: false } }
);

const authService = {
    login: async (email, password) => {
        if (typeof email !== 'string' || typeof password !== 'string') {
            throw new HttpError(400, 'Informe e-mail e senha');
        }
        const user = await userService.findByEmailWithPassword(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new HttpError(401, 'E-mail ou senha inválidos');
        }
        if (!user.active) {
            throw new HttpError(403, 'Usuário desativado');
        }
        const { password: _password, ...safeUser } = user.toJSON();
        return {
            accessToken: signAccessToken(user),
            refreshToken: await createRefreshToken(user),
            user: safeUser
        };
    },

    refresh: async (token) => {
        if (typeof token !== 'string') {
            throw new HttpError(401, 'Refresh token não informado');
        }
        const stored = await RefreshToken.findOne({ where: { token } });
        if (!stored) {
            throw invalidRefreshToken();
        }
        // Token já revogado voltando a ser usado: alguém tem uma cópia dele.
        // Como não dá para saber quem é o dono legítimo, derruba todas as sessões.
        if (stored.revoked) {
            await revokeAllFromUser(stored.userId);
            throw invalidRefreshToken();
        }
        if (stored.expiresAt <= new Date()) {
            throw invalidRefreshToken();
        }
        const user = await userService.findById(stored.userId);
        if (!user || !user.active) {
            throw invalidRefreshToken();
        }

        // Rotação: revogar o antigo e criar o novo acontecem juntos ou não acontecem.
        const newRefreshToken = await db.transaction(async (transaction) => {
            // O "revoked: false" no where garante que, se duas requisições chegarem
            // com o mesmo token ao mesmo tempo, só uma consegue revogar.
            const [revokedCount] = await RefreshToken.update(
                { revoked: true },
                { where: { id: stored.id, revoked: false }, transaction }
            );
            if (revokedCount === 0) {
                return null;
            }
            return createRefreshToken(user, transaction);
        });

        if (!newRefreshToken) {
            await revokeAllFromUser(stored.userId);
            throw invalidRefreshToken();
        }
        return { accessToken: signAccessToken(user), refreshToken: newRefreshToken };
    },

    logout: async (token, userId) => {
        if (typeof token !== 'string') {
            throw new HttpError(400, 'Informe o refresh token');
        }
        // O userId no where impede de revogar o token de outra pessoa.
        await RefreshToken.update({ revoked: true }, { where: { token, userId } });
    },

    me: async (userId) => {
        const user = await userService.findById(userId);
        if (!user) {
            throw new HttpError(401, 'Usuário não encontrado');
        }
        return user;
    },

    verifyToken: async (token) => jwt.verify(token, process.env.JWT_SECRET)
};

module.exports = authService;
