const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAccount() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'team06'
        });

        console.log('Checking account ACC1001...\n');

        // Check account
        const [accounts] = await connection.query(
            'SELECT * FROM account WHERE Account_No = ?',
            ['ACC1001']
        );
        
        if (accounts.length > 0) {
            console.log('Account found:');
            console.table(accounts);
            
            const accountId = accounts[0].AccountID;
            
            // Check records for this account
            console.log(`\nChecking RECORDS for Account_ID ${accountId}...\n`);
            const [records] = await connection.query(
                'SELECT * FROM records WHERE Account_ID = ? ORDER BY Date DESC',
                [accountId]
            );
            
            console.log(`Found ${records.length} records:`);
            if (records.length > 0) {
                console.table(records);
            } else {
                console.log('No records found for this account.');
            }
        } else {
            console.log('Account ACC1001 not found!');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkAccount();
