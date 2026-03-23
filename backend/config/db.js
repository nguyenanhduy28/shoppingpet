const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // For Azure
        trustServerCertificate: true // Change to false for production
    }
};

const connectDB = async () => {
    try {
        const pool = await sql.connect(config);
        console.log('SQL Server Connected...');
        return pool;
    } catch (err) {
        console.error('Database Connection Failed! Bad Config: ', err);
        process.exit(1);
    }
};

module.exports = {
    sql,
    connectDB
};
