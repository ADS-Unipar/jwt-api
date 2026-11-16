const { Op } = require('sequelize');
const { db, Book, Author, Category, BookAuthor, Loan } = require('../models');
const { LOAN_STATUS } = require('../loan/loan.model');
const { badRequest, notFound, conflict } = require('../utils/httpError');

const include = [
    { model: Category, as: 'category', attributes: ['id', 'name'] },
    { model: Author, as: 'authors', attributes: ['id', 'name'], through: { attributes: [] } }
];

const toIntOrUndefined = (v) => (v === undefined || v === '' ? undefined : Number(v));

const validateCategory = async (categoryId, transaction) => {
    if (categoryId === undefined || categoryId === null) throw badRequest('categoryId é obrigatório.');
    const category = await Category.findByPk(categoryId, { transaction });
    if (!category) throw badRequest(`Categoria ${categoryId} não existe.`);
};

const validateAuthors = async (authorIds, transaction) => {
    if (!Array.isArray(authorIds) || authorIds.length === 0) {
        throw badRequest('Informe ao menos um autor em authorIds (array de ids).');
    }
    const ids = [...new Set(authorIds.map(Number))];
    const found = await Author.findAll({ where: { id: ids }, attributes: ['id'], transaction });
    if (found.length !== ids.length) {
        const foundIds = found.map((a) => a.id);
        const missing = ids.filter((id) => !foundIds.includes(id));
        throw badRequest(`Autor(es) inexistente(s): ${missing.join(', ')}.`);
    }
    return ids;
};

const validateCopies = (totalCopies) => {
    if (!Number.isInteger(totalCopies) || totalCopies < 0) {
        throw badRequest('totalCopies deve ser um inteiro maior ou igual a 0.');
    }
};

const bookService = {
    findAll: async ({ title, categoryId, authorId, available } = {}) => {
        const where = {};
        if (title) where.title = { [Op.like]: `%${title}%` };
        if (categoryId) where.categoryId = Number(categoryId);
        if (available === 'true') where.availableCopies = { [Op.gt]: 0 };
        if (available === 'false') where.availableCopies = 0;
        if (authorId) {
            // Filtra pelos ids na tabela de junção para continuar trazendo TODOS os autores do livro.
            const links = await BookAuthor.findAll({ where: { authorId: Number(authorId) }, attributes: ['bookId'] });
            where.id = links.map((l) => l.bookId);
        }
        return Book.findAll({ where, include, order: [['title', 'ASC']] });
    },

    findById: async (id) => {
        const book = await Book.findByPk(id, { include });
        if (!book) throw notFound('Livro não encontrado.');
        return book;
    },

    create: async (data = {}) => {
        const { title, isbn, year, categoryId, authorIds } = data;
        const totalCopies = toIntOrUndefined(data.totalCopies) ?? 1;
        validateCopies(totalCopies);

        const id = await db.transaction(async (transaction) => {
            await validateCategory(categoryId, transaction);
            const ids = await validateAuthors(authorIds, transaction);
            const book = await Book.create(
                { title, isbn, year, categoryId, totalCopies, availableCopies: totalCopies },
                { transaction }
            );
            await book.setAuthors(ids, { transaction });
            return book.id;
        });
        return bookService.findById(id);
    },

    update: async (id, data = {}) => {
        await db.transaction(async (transaction) => {
            const book = await Book.findByPk(id, { transaction });
            if (!book) throw notFound('Livro não encontrado.');

            const fields = {};
            for (const key of ['title', 'isbn', 'year']) {
                if (data[key] !== undefined) fields[key] = data[key];
            }
            if (data.categoryId !== undefined) {
                await validateCategory(data.categoryId, transaction);
                fields.categoryId = data.categoryId;
            }
            if (data.totalCopies !== undefined) {
                const totalCopies = toIntOrUndefined(data.totalCopies);
                validateCopies(totalCopies);
                const borrowed = book.totalCopies - book.availableCopies;
                if (totalCopies < borrowed) {
                    throw conflict(`Não é possível reduzir para ${totalCopies} exemplar(es): ${borrowed} estão emprestados.`);
                }
                fields.totalCopies = totalCopies;
                fields.availableCopies = totalCopies - borrowed;
            }
            await book.update(fields, { transaction });

            if (data.authorIds !== undefined) {
                const ids = await validateAuthors(data.authorIds, transaction);
                await book.setAuthors(ids, { transaction });
            }
        });
        return bookService.findById(id);
    },

    remove: async (id) => {
        await db.transaction(async (transaction) => {
            const book = await Book.findByPk(id, { transaction });
            if (!book) throw notFound('Livro não encontrado.');

            const active = await Loan.count({
                where: { bookId: book.id, status: [LOAN_STATUS.ATIVO, LOAN_STATUS.ATRASADO] },
                transaction
            });
            if (active > 0) {
                throw conflict(`Não é possível excluir: o livro possui ${active} empréstimo(s) em aberto.`);
            }
            const history = await Loan.count({ where: { bookId: book.id }, transaction });
            if (history > 0) {
                throw conflict('Não é possível excluir: o livro possui histórico de empréstimos.');
            }

            await book.setAuthors([], { transaction });
            await book.destroy({ transaction });
        });
    }
};

module.exports = bookService;
