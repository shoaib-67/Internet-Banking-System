const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTestRecord() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'team06'
        });

        console.log('Adding test record for ACC1001 (Account_ID 1)...\n');

        // Insert a test record
        await connection.query(
            'INSERT INTO records (Account_ID, Amount, Date, Status) VALUES (?, ?, NOW(), ?)',
            [1, 100.00, 'Completed']
        );

        console.log('✅ Test record added successfully!');
        
        // Verify
        const [records] = await connection.query(
            'SELECT * FROM records WHERE Account_ID = 1 ORDER BY Date DESC',
            []
        );
        
        console.log(`\nRecords for ACC1001:`);
        console.table(records);

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

addTestRecord();
