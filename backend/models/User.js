const { DataTypes} = require('sequelize');
const db = require('../db/conn') // Importa a conexão

const User = db.define('User', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Não permite e-mails duplicados
        validate: {
            isEmail: true // Validação nativa do formato de e-mail
        }
    },

    msg: {
        type: DataTypes.STRING,
        allowNull: false
    }
    
});

module.exports = User;

