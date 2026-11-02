const HttpError = require('./httpError');

// O service devolve null quando não acha o registro; o controller vira isso em 404.
const foundOr404 = (record, message) => {
    if (!record) {
        throw new HttpError(404, message);
    }
    return record;
};

module.exports = foundOr404;
