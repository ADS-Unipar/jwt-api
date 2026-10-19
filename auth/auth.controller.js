const authService = require('./auth.service');

const authController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const token = await authService.login(email, password);
            res.json({ token });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    },

    async logout(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            await authService.logout(token);
            res.json({ message: 'Logout successful' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = authController;