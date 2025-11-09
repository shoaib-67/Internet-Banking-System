// Watch database changes in real-time
require('dotenv').config();
const mysql = require('mysql2/promise');

async function watchDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'team06'
  });

  console.log('👀 Watching team06 database for changes...\n');
  console.log('Press Ctrl+C to stop\n');

  setInterval(async () => {
    try {
      console.clear();
      console.log('🔄 Database Status - ' + new Date().toLocaleTimeString());
      console.log('='.repeat(60));

      const tables = ['account', 'customer', 'loan', 'payment_service', 'repayment', 'takes'];
      
      for (const table of tables) {
        try {
          const [count] = await connection.query(`SELECT COUNT(*) as total FROM ${table}`);
          console.log(`${table.padEnd(20)} : ${count[0].total} records`);
        } catch (err) {
          console.log(`${table.padEnd(20)} : Table not found`);
        }
      }

      console.log('\n' + '='.repeat(60));
      console.log('Refreshing every 3 seconds...');
    } catch (error) {
      console.error('Error:', error.message);
    }
  }, 3000);
}

watchDatabase().catch(console.error);
