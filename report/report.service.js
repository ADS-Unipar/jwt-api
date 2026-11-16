const { Book, Reader, Loan } = require('../models');
const { LOAN_STATUS } = require('../loan/loan.model');
const loanService = require('../loan/loan.service');

const reportService = {
    dashboard: async () => {
        await loanService.markOverdue();

        const [totalTitles, totalCopies, availableCopies, totalReaders, activeLoans, overdueLoans, finesCollected, openLoans] =
            await Promise.all([
                Book.count(),
                Book.sum('totalCopies'),
                Book.sum('availableCopies'),
                Reader.count(),
                Loan.count({ where: { status: LOAN_STATUS.ATIVO } }),
                Loan.count({ where: { status: LOAN_STATUS.ATRASADO } }),
                Loan.sum('fine', { where: { status: LOAN_STATUS.DEVOLVIDO } }),
                Loan.findAll({ where: { status: LOAN_STATUS.ATRASADO } })
            ]);

        const pendingFines = openLoans
            .map(loanService.serialize)
            .reduce((sum, l) => sum + (l.estimatedFine || 0), 0);

        return {
            totalBooks: totalTitles,
            totalCopies: totalCopies || 0,
            availableCopies: availableCopies || 0,
            totalReaders,
            activeLoans,          // em dia
            overdueLoans,         // atrasados
            borrowedCopies: activeLoans + overdueLoans,
            finesCollected: Number(finesCollected || 0),   // multas de devoluções já feitas
            pendingFines         // multas acumuladas dos atrasados ainda não devolvidos
        };
    }
};

module.exports = reportService;
