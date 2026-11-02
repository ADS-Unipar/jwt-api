const { Op } = require('sequelize');
const db = require('../config/db');
const { Book, BookAuthor, Author, Category } = require('../models');
const HttpError = require('../utils/httpError');
const pick = require('../utils/pick');

const FIELDS = ['title', 'isbn', 'year'];

const INCLUDE = [
    { model: Category, as: 'category', attributes: ['id', 'name'] },
    { model: Author, as: 'authors', attributes: ['id', 'name'], through: { attributes: [] } }
];

const parseTotalCopies = (value) => {
    const total = Number(value);
    if (!Number.isInteger(total) || total < 0) {
        throw new HttpError(400, 'O total de exemplares deve ser um número inteiro, zero ou maior');
    }
    return total;
};

const validateCategory = async (categoryId) => {
    const id = Number(categoryId);
    if (!Number.isInteger(id) || !(await Category.findByPk(id))) {
        throw new HttpError(400, 'Selecione uma categoria válida');
    }
    return id;
};

const validateAuthors = async (authorIds) => {
    if (!Array.isArray(authorIds) || authorIds.length === 0) {
        throw new HttpError(400, 'Selecione pelo menos um autor');
    }
    const ids = [...new Set(authorIds.map(Number))];
    if (!ids.every(Number.isInteger) || await Author.count({ where: { id: ids } }) !== ids.length) {
        throw new HttpError(400, 'A lista de autores tem um autor que não existe');
    }
    return ids;
};

const buildFilters = async ({ title, categoryId, authorId, available }) => {
    const where = {};
    if (typeof title === 'string' && title) {
        where.title = { [Op.substring]: title };
    }
    if (categoryId) {
        where.categoryId = categoryId;
    }
    if (available === 'true') {
        where.availableCopies = { [Op.gt]: 0 };
    }
    if (available === 'false') {
        where.availableCopies = 0;
    }
    if (authorId) {
        // Busca os ids antes: filtrar direto no include faria a resposta trazer
        // só o autor pesquisado, escondendo os coautores do livro.
        const links = await BookAuthor.findAll({ where: { authorId }, attributes: ['bookId'] });
        where.id = links.map((link) => link.bookId);
    }
    return where;
};

const bookService = {
    create: async (data) => {
        const categoryId = await validateCategory(data?.categoryId);
        const authorIds = await validateAuthors(data?.authorIds);
        const totalCopies = parseTotalCopies(data?.totalCopies ?? 1);

        const id = await db.transaction(async (transaction) => {
            const book = await Book.create({
                ...pick(data, FIELDS),
                categoryId,
                totalCopies,
                availableCopies: totalCopies // livro novo: nenhum exemplar emprestado
            }, { transaction });
            await book.setAuthors(authorIds, { transaction });
            return book.id;
        });
        return bookService.findById(id);
    },
    findAll: async (filters) => {
        return await Book.findAll({
            where: await buildFilters(filters),
            include: INCLUDE,
            order: [['title', 'ASC']]
        });
    },
    findById: async (id) => {
        return await Book.findByPk(id, { include: INCLUDE });
    },
    update: async (id, data) => {
        const fields = pick(data, FIELDS);
        if (data?.categoryId !== undefined) {
            fields.categoryId = await validateCategory(data.categoryId);
        }
        const authorIds = data?.authorIds !== undefined ? await validateAuthors(data.authorIds) : null;
        const newTotal = data?.totalCopies !== undefined ? parseTotalCopies(data.totalCopies) : null;

        const updated = await db.transaction(async (transaction) => {
            const book = await Book.findByPk(id, { transaction });
            if (!book) {
                return false;
            }
            // availableCopies não vem do cliente: quem mexe nele são os empréstimos.
            // Mudar o total só soma ou tira a diferença, mantendo os que estão emprestados.
            if (newTotal !== null) {
                const loaned = book.totalCopies - book.availableCopies;
                if (newTotal < loaned) {
                    throw new HttpError(409, `O total não pode ser menor que a quantidade emprestada (${loaned})`);
                }
                fields.totalCopies = newTotal;
                fields.availableCopies = newTotal - loaned;
            }
            await book.update(fields, { transaction });
            if (authorIds) {
                await book.setAuthors(authorIds, { transaction });
            }
            return true;
        });
        return updated ? bookService.findById(id) : null;
    },
    remove: async (id) => {
        const book = await Book.findByPk(id);
        if (!book) {
            return null;
        }
        // Regra 6. Empréstimo devolvido também conta: é o histórico do leitor.
        if (await book.countLoans() > 0) {
            throw new HttpError(409, 'Não é possível excluir: o livro tem empréstimos registrados');
        }
        await book.destroy();
        return book;
    }
};

module.exports = bookService;
