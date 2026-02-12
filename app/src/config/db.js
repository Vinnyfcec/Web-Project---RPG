import dotenv from 'dotenv';
import mysql from 'mysql2';
dotenv.config();

const connection = mysql.createPool({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name,
});

export default connection.promise();