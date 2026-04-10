const sql = require('mssql');
require('dotenv').config();

const dbSettings = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: false, // Usualmente false para conexiones locales
        trustServerCertificate: true // Importante para evitar errores de certificados en local
    }
};

const connectDB = async () => {
    try {
        const pool = await sql.connect(dbSettings);
        console.log('✅ Conexión exitosa a SQL Server');
        return pool;
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error.message);
    }
};

// Ejecutamos la conexión al arrancar
connectDB();

module.exports = { sql, connectDB };