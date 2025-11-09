// Simple script to view database contents
require('dotenv').config();
const mysql = require('mysql2/promise');

async function viewDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'team06'
    });

    console.log('✅ Connected to team06 database!\n');

    // Show all tables
    console.log('📋 Tables in team06:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });

    console.log('\n');

    // Show data from each table
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      console.log(`\n📊 Data from ${tableName}:`);
      
      const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 5`);
      
      if (rows.length === 0) {
        console.log('  (empty table)');
      } else {
        console.table(rows);
        const [count] = await connection.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        console.log(`  Total rows: ${count[0].total}\n`);
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

viewDatabase();
