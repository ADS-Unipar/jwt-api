const reportService = require('./report.service');

const reportController = {
    dashboard: async (req, res) => {
        res.json(await reportService.dashboard());
    }
};

module.exports = reportController;
