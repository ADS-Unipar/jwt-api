// Datas de empréstimo são DATEONLY (YYYY-MM-DD), no fuso local do servidor.
const toDateOnly = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const today = () => toDateOnly(new Date());

const addDays = (dateOnly, days) => {
    const [y, m, d] = dateOnly.split('-').map(Number);
    return toDateOnly(new Date(y, m - 1, d + days));
};

// Diferença em dias inteiros entre duas datas YYYY-MM-DD (b - a).
const diffDays = (a, b) => {
    const toUTC = (s) => {
        const [y, m, d] = s.split('-').map(Number);
        return Date.UTC(y, m - 1, d);
    };
    return Math.round((toUTC(b) - toUTC(a)) / 86400000);
};

module.exports = { today, addDays, diffDays };
