// Erro de regra de negócio com o status HTTP que ele deve gerar.
// O service lança e o errorHandler transforma em resposta.
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

module.exports = HttpError;
