const { Sequelize } = require('sequelize');

// Carrega o dotenv para ler o arquivo .env
require('dotenv').config({ path: './.env' });

const sequelize = new Sequelize('verve_db', 'root', process.env.DB_PASS, {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false // Evita poluir o terminal com logs de queries SQL puras
});

// Teste de conexão imediato ao iniciar
async function testConn() {
    try {
        await sequelize.authenticate();
        console.log('Conexão estável com MySQL Global (3306) estabelecida.');
    } catch (error) {
        console.error('Erro de conexão:', error);
    };
};

testConn();

module.exports = sequelize;
