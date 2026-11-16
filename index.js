const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { db } = require('./models');
const { seedAdmin } = require('./config/seed');
const errorHandler = require('./utils/errorHandler');

const authRouter = require('./auth/auth.router');
const userRouter = require('./user/user.router');
const categoryRouter = require('./category/category.router');
const authorRouter = require('./author/author.router');
const bookRouter = require('./book/book.router');
const readerRouter = require('./reader/reader.router');
const loanRouter = require('./loan/loan.router');
const reportRouter = require('./report/report.router');

for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    if (!process.env[key]) {
        console.error(`Variável de ambiente ${key} não definida. Copie .envex para .env e preencha.`);
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()),
    credentials: true
}));
app.use(express.json());

app.use('/v1/auth', authRouter);
app.use('/v1/user', userRouter);
app.use('/v1/categories', categoryRouter);
app.use('/v1/authors', authorRouter);
app.use('/v1/books', bookRouter);
app.use('/v1/readers', readerRouter);
app.use('/v1/loans', loanRouter);
app.use('/v1/reports', reportRouter);

app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
app.use(errorHandler);

const start = async () => {
    await db.sync();
    await seedAdmin();
    app.listen(PORT, () => {
        console.log(`SERVIDOR RODANDO http://localhost:${PORT}`);
    });
};

start().catch((err) => {
    console.error('Falha ao iniciar a API:', err);
    process.exit(1);
});
