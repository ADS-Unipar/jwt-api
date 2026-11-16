const { Op } = require('sequelize');
const { Author, BookAuthor } = require('../models');
const { notFound, conflict } = require('../utils/httpError');

const pick = ({ name, nationality, birthDate } = {}) =>
    Object.fromEntries(Object.entries({ name, nationality, birthDate }).filter(([, v]) => v !== undefined));

const authorService = {
    findAll: ({ name } = {}) => Author.findAll({
        where: name ? { name: { [Op.like]: `%${name}%` } } : undefined,
        order: [['name', 'ASC']]
    }),

    findById: async (id) => {
        const author = await Author.findByPk(id);
        if (!author) throw notFound('Autor não encontrado.');
        return author;
    },

    create: (data) => Author.create(pick(data)),

    update: async (id, data) => {
        const author = await authorService.findById(id);
        return author.update(pick(data));
    },

    remove: async (id) => {
        const author = await authorService.findById(id);
        const books = await BookAuthor.count({ where: { authorId: author.id } });
        if (books > 0) {
            throw conflict(`Não é possível excluir: o autor está vinculado a ${books} livro(s).`);
        }
        await author.destroy();
    }
};

module.exports = authorService;
