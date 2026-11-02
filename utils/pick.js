// Copia só os campos permitidos do corpo da requisição. Evita que o cliente
// altere o que não deve (id, active...) mandando o campo no JSON.
// Campo ausente fica de fora, para um update parcial não apagar o valor atual.
const pick = (source, fields) => {
    const result = {};
    for (const field of fields) {
        if (source?.[field] !== undefined) {
            result[field] = source[field];
        }
    }
    return result;
};

module.exports = pick;
