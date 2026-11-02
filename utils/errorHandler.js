const HttpError = require('./httpError');

const UNIQUE_FIELD_LABELS = {
    email: 'este e-mail',
    username: 'este nome de usuário',
    name: 'este nome',
    isbn: 'este ISBN',
    cpf: 'este CPF'
};

// O Express 5 encaminha para cá qualquer erro lançado em handler async,
// então os controllers não precisam de try/catch.
// Precisa ter os 4 parâmetros: é assim que o Express reconhece o middleware de erro.
const errorHandler = (error, req, res, next) => {
    if (error instanceof HttpError) {
        return res.status(error.status).json({ error: error.message });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
        const label = UNIQUE_FIELD_LABELS[error.errors[0]?.path] || 'estes dados';
        return res.status(409).json({ error: `Já existe um cadastro com ${label}` });
    }
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: error.errors.map((e) => e.message).join('; ') });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ error: 'Operação bloqueada: o registro tem vínculos com outros dados' });
    }
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'O corpo da requisição não é um JSON válido' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
};

module.exports = errorHandler;
