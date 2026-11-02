// Datas no formato YYYY-MM-DD, o mesmo do DATEONLY do Sequelize.
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Hoje no fuso local. toISOString() usaria UTC: à noite no Brasil ele já
// devolveria o dia seguinte.
const today = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
};

// Uma string YYYY-MM-DD é lida como meia-noite UTC, então aqui as contas ficam
// todas em UTC e sempre dão dias inteiros, sem influência de fuso.
const addDays = (date, days) => {
    return new Date(new Date(date).getTime() + days * ONE_DAY_MS).toISOString().slice(0, 10);
};

const daysBetween = (start, end) => {
    return Math.round((new Date(end) - new Date(start)) / ONE_DAY_MS);
};

module.exports = { today, addDays, daysBetween };
