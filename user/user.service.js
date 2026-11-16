const bcrypt = require('bcrypt');
const { User, RefreshToken } = require('../models');
const { badRequest, notFound } = require('../utils/httpError');

const pickUserFields = (data, { includePassword }) => {
    const allowed = ['name', 'username', 'email', 'isAdmin', 'active'];
    if (includePassword) allowed.push('password');
    return Object.fromEntries(Object.entries(data ?? {}).filter(([k]) => allowed.includes(k)));
};

const validatePassword = (password) => {
    if (typeof password !== 'string' || password.length < 6) {
        throw badRequest('A senha deve ter pelo menos 6 caracteres.');
    }
};

const userService = {
    create: async (data) => {
        const fields = pickUserFields(data, { includePassword: true });
        validatePassword(fields.password);
        fields.password = await bcrypt.hash(fields.password, 10);
        const user = await User.create(fields);
        return User.findByPk(user.id);
    },

    update: async (id, data) => {
        const user = await User.findByPk(id);
        if (!user) throw notFound('Usuário não encontrado.');
        const fields = pickUserFields(data, { includePassword: true });
        delete fields.active; // ativação tem rota própria
        if (fields.password !== undefined) {
            validatePassword(fields.password);
            fields.password = await bcrypt.hash(fields.password, 10);
        }
        await user.update(fields);
        return User.findByPk(id);
    },

    setActive: async (id, active, currentUserId) => {
        if (typeof active !== 'boolean') throw badRequest('Informe "active" como true ou false.');
        const user = await User.findByPk(id);
        if (!user) throw notFound('Usuário não encontrado.');
        if (user.id === currentUserId && !active) {
            throw badRequest('Você não pode desativar o próprio usuário.');
        }
        await user.update({ active });
        // Desativado: encerra todas as sessões (não consegue mais renovar o token).
        if (!active) {
            await RefreshToken.update({ revoked: true }, { where: { userId: user.id, revoked: false } });
        }
        return user;
    },

    findById: async (id) => {
        const user = await User.findByPk(id);
        if (!user) throw notFound('Usuário não encontrado.');
        return user;
    },

    findByEmail: async (email) => {
        const user = await User.findOne({ where: { email } });
        if (!user) throw notFound('Usuário não encontrado.');
        return user;
    },

    findAll: () => User.findAll({ order: [['name', 'ASC']] })
};

module.exports = userService;
