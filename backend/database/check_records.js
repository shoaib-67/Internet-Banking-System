const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRecords() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'team06'
        });

        console.log('Connected to database...\n');

        // Check if RECORDS table exists
        const [tables] = await connection.query("SHOW TABLES LIKE 'records'");
        if (tables.length === 0) {
            console.log('❌ RECORDS table does not exist!');
        } else {
            console.log('✅ RECORDS table exists\n');
            
            // Check records
            const [records] = await connection.query('SELECT * FROM records ORDER BY Date DESC LIMIT 10');
            console.log(`Found ${records.length} records:\n`);
            
            if (records.length > 0) {
                console.table(records);
            } else {
                console.log('No records found. Try adding money or performing a transaction.');
            }
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkRecords();
