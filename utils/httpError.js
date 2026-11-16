// Erro com status HTTP. Os services lançam HttpError e o errorHandler
// (index.js) converte em resposta JSON. O Express 5 já encaminha erros
// de funções async para o errorHandler, então os controllers não precisam de try/catch.
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const badRequest = (msg) => new HttpError(400, msg);
const unauthorized = (msg) => new HttpError(401, msg);
const forbidden = (msg) => new HttpError(403, msg);
const notFound = (msg) => new HttpError(404, msg);
const conflict = (msg) => new HttpError(409, msg);

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict };
