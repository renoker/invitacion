const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'tnb', // Usuario de MySQL
    password: 'tnb', // Contraseña de MySQL
    database: 'invitacion', // Nombre de la base de datos
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL establecida correctamente');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        return false;
    }
}

// Initialize database and create table if it doesn't exist
async function initializeDatabase() {
    try {
        // First, connect without specifying database to create it if needed
        const tempPool = mysql.createPool({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });

        // Create database if it doesn't exist
        await tempPool.execute('CREATE DATABASE IF NOT EXISTS invitacion');
        console.log('✅ Base de datos "invitacion" verificada/creada');

        await tempPool.end();

        // Create table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS invitados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL,
                telefono VARCHAR(20) NOT NULL,
                num_asistentes INT NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        await pool.execute(createTableQuery);
        console.log('✅ Tabla "invitados" verificada/creada');

        return true;
    } catch (error) {
        console.error('❌ Error inicializando la base de datos:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    testConnection,
    initializeDatabase
};
