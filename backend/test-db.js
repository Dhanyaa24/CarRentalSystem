const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Starting database connection test...');
console.log('Using configuration:', {
    host: 'localhost',
    user: 'root',
    database: 'ecoride_db',
    port: 3306
});

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'dhanya24',
            database: 'ecoride_db'
        });
        
        console.log('Successfully connected to MySQL!');
        
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Database tables:', rows);
        
        await connection.end();
    } catch (error) {
        console.error('Database connection error:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState
        });
    }
}

testConnection();
