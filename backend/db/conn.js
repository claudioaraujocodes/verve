const path = require('path');
const { Sequelize } = require('sequelize');

// Carrega o .env a partir da pasta backend ou da raiz do projeto
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const dbName = process.env.DB_NAME || 'verve_db';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASS || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false // Evita poluir o terminal com logs de queries SQL puras
});

// Teste de conexão imediato ao iniciar
async function testConn() {
    try {
        await sequelize.authenticate();
        console.log(`Conexão estável com MySQL (${dbHost}:${dbPort} / ${dbName}) estabelecida.`);
    } catch (error) {
        console.error('Erro de conexão:', error);
    }
}

testConn();

module.exports = sequelize;
