const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAccountById() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'team06'
        });

        console.log('Checking Account_ID 14...\n');

        const [accounts] = await connection.query(
            'SELECT a.*, c.Name, c.Phone FROM account a LEFT JOIN customer c ON a.CustomerID = c.CustomerID WHERE a.AccountID = ?',
            [14]
        );
        
        if (accounts.length > 0) {
            console.log('Account details:');
            console.table(accounts);
        } else {
            console.log('Account not found!');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkAccountById();
