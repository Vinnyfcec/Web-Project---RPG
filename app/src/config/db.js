require('dotenv').config();
const mysql = require('mysql2'); 

const connection = mysql.createPool({
    host: process.env.db_host || 'localhost',
    user: process.env.db_user || 'root',
    password: process.env.db_password || 'aluno123',
    database: process.env.db_name || 'rpg_db',
});

module.exports = connection.promise();
