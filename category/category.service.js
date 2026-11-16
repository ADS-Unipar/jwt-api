const { Op } = require('sequelize');
const { Category, Book } = require('../models');
const { notFound, conflict } = require('../utils/httpError');

const pick = ({ name, description } = {}) =>
    Object.fromEntries(Object.entries({ name, description }).filter(([, v]) => v !== undefined));

const categoryService = {
    findAll: ({ name } = {}) => Category.findAll({
        where: name ? { name: { [Op.like]: `%${name}%` } } : undefined,
        order: [['name', 'ASC']]
    }),

    findById: async (id) => {
        const category = await Category.findByPk(id);
        if (!category) throw notFound('Categoria não encontrada.');
        return category;
    },

    create: (data) => Category.create(pick(data)),

    update: async (id, data) => {
        const category = await categoryService.findById(id);
        return category.update(pick(data));
    },

    remove: async (id) => {
        const category = await categoryService.findById(id);
        const books = await Book.count({ where: { categoryId: category.id } });
        if (books > 0) {
            throw conflict(`Não é possível excluir: a categoria possui ${books} livro(s) vinculado(s).`);
        }
        await category.destroy();
    }
};

module.exports = categoryService;
