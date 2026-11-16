const { HttpError } = require('./httpError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors?.[0]?.path;
        return res.status(409).json({ error: `Já existe um registro com este valor de ${field}.` });
    }

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: err.errors.map((e) => e.message).join('; ') });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ error: 'Operação viola um vínculo com outro registro.' });
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
    }

    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
};

module.exports = errorHandler;
