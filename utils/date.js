// Data de hoje no fuso local, no formato YYYY-MM-DD (o mesmo do DATEONLY).
// toISOString() usaria UTC: à noite no Brasil ele já devolveria o dia seguinte.
const today = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
};

module.exports = { today };
