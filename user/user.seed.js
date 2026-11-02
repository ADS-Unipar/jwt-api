const User = require('./user.model');
const userService = require('./user.service');

// A rota de criar usuário exige admin, então o primeiro admin nasce aqui.
// Só cria se não houver nenhum: reiniciar a API não duplica nem altera nada.
const seedAdmin = async () => {
    const admins = await User.count({ where: { isAdmin: true } });
    if (admins > 0) {
        return;
    }
    const admin = await userService.create({
        name: process.env.ADMIN_NAME || 'Admin',
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@biblioteca.com',
        password: process.env.ADMIN_PASSWORD || '123456',
        isAdmin: true
    });
    console.log(`Admin inicial criado: ${admin.email}`);
};

module.exports = seedAdmin;
