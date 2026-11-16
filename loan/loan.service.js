const { Op } = require('sequelize');
const { db, Loan, Book, Reader, User } = require('../models');
const { LOAN_STATUS } = require('./loan.model');
const { HttpError, badRequest, notFound, conflict } = require('../utils/httpError');
const { today, addDays, diffDays } = require('../utils/date');

const LOAN_DAYS = 7;
const MAX_ACTIVE_LOANS = 3;
const FINE_PER_DAY = 1.0;

const unprocessable = (msg) => new HttpError(422, msg);

const include = [
    { model: Book, as: 'book', attributes: ['id', 'title', 'isbn'] },
    { model: Reader, as: 'reader', attributes: ['id', 'name', 'cpf'] },
    { model: User, as: 'user', attributes: ['id', 'name'] }
];

const calcFine = (dueDate, referenceDate) => {
    const daysLate = Math.max(0, diffDays(dueDate, referenceDate));
    return { daysLate, fine: daysLate * FINE_PER_DAY };
};

// Acrescenta daysLate e (para empréstimos em aberto) a multa estimada até hoje,
// para o front exibir antes de confirmar a devolução.
const serialize = (loan) => {
    const json = loan.toJSON();
    if (json.status === LOAN_STATUS.DEVOLVIDO) {
        json.daysLate = calcFine(json.dueDate, json.returnDate).daysLate;
    } else {
        const { daysLate, fine } = calcFine(json.dueDate, today());
        json.daysLate = daysLate;
        json.estimatedFine = fine;
    }
    return json;
};

// "ATRASADO" é derivado: dueDate < hoje e ainda sem devolução.
// Atualizamos no banco antes de cada consulta para que filtros e contagens fiquem corretos.
const markOverdue = (transaction) => Loan.update(
    { status: LOAN_STATUS.ATRASADO },
    { where: { status: LOAN_STATUS.ATIVO, dueDate: { [Op.lt]: today() } }, transaction }
);

const loanService = {
    markOverdue,
    serialize,

    findAll: async ({ status, readerId, bookId } = {}) => {
        await markOverdue();
        const where = {};
        if (status) {
            const statuses = String(status).toUpperCase().split(',');
            const invalid = statuses.filter((s) => !Object.values(LOAN_STATUS).includes(s));
            if (invalid.length) throw badRequest(`Status inválido: ${invalid.join(', ')}. Use ATIVO, ATRASADO ou DEVOLVIDO.`);
            where.status = statuses;
        }
        if (readerId) where.readerId = Number(readerId);
        if (bookId) where.bookId = Number(bookId);
        const loans = await Loan.findAll({ where, include, order: [['loanDate', 'DESC'], ['id', 'DESC']] });
        return loans.map(serialize);
    },

    findById: async (id) => {
        await markOverdue();
        const loan = await Loan.findByPk(id, { include });
        if (!loan) throw notFound('Empréstimo não encontrado.');
        return serialize(loan);
    },

    create: async ({ bookId, readerId } = {}, userId) => {
        if (!bookId || !readerId) throw badRequest('bookId e readerId são obrigatórios.');

        const id = await db.transaction(async (transaction) => {
            await markOverdue(transaction);

            const reader = await Reader.findByPk(readerId, { transaction });
            if (!reader) throw notFound('Leitor não encontrado.');
            const book = await Book.findByPk(bookId, { transaction });
            if (!book) throw notFound('Livro não encontrado.');

            const overdue = await Loan.count({ where: { readerId, status: LOAN_STATUS.ATRASADO }, transaction });
            if (overdue > 0) {
                throw unprocessable('O leitor possui empréstimo(s) em atraso e não pode pegar novos livros.');
            }

            const open = await Loan.count({ where: { readerId, status: LOAN_STATUS.ATIVO }, transaction });
            if (open >= MAX_ACTIVE_LOANS) {
                throw unprocessable(`O leitor já possui ${MAX_ACTIVE_LOANS} empréstimos ativos (limite máximo).`);
            }

            // Decremento condicional: só altera se ainda houver exemplar, evitando estoque negativo.
            const [affected] = await Book.update(
                { availableCopies: db.literal('availableCopies - 1') },
                { where: { id: book.id, availableCopies: { [Op.gt]: 0 } }, transaction }
            );
            if (affected === 0) throw unprocessable('Não há exemplares disponíveis deste livro.');

            const loanDate = today();
            const loan = await Loan.create({
                bookId: book.id,
                readerId: reader.id,
                userId,
                loanDate,
                dueDate: addDays(loanDate, LOAN_DAYS),
                status: LOAN_STATUS.ATIVO
            }, { transaction });
            return loan.id;
        });

        return loanService.findById(id);
    },

    returnLoan: async (id) => {
        await db.transaction(async (transaction) => {
            const loan = await Loan.findByPk(id, { transaction });
            if (!loan) throw notFound('Empréstimo não encontrado.');
            if (loan.status === LOAN_STATUS.DEVOLVIDO) throw conflict('Este empréstimo já foi devolvido.');

            const returnDate = today();
            const { fine } = calcFine(loan.dueDate, returnDate);
            await loan.update({ returnDate, fine, status: LOAN_STATUS.DEVOLVIDO }, { transaction });
            await Book.increment('availableCopies', { by: 1, where: { id: loan.bookId }, transaction });
        });
        return loanService.findById(id);
    }
};

module.exports = loanService;
