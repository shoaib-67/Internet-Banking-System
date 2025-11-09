const mysql = require('mysql2/promise');
require('dotenv').config();

async function createRecordsTable() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'team06'
        });

        console.log('Connected to database...');

        // Create RECORDS table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS records (
                Transaction_ID INT AUTO_INCREMENT PRIMARY KEY,
                Account_ID INT NOT NULL,
                Amount DECIMAL(10,2) NOT NULL,
                Date DATETIME DEFAULT CURRENT_TIMESTAMP,
                Status VARCHAR(50) NOT NULL,
                FOREIGN KEY (Account_ID) REFERENCES account(AccountID)
            )
        `);

        console.log('✅ RECORDS table created successfully!');

        await connection.end();
    } catch (error) {
        console.error('❌ Error creating RECORDS table:', error);
        process.exit(1);
    }
}

createRecordsTable();
