const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const loanRoutes = require('./routes/loans');
const billRoutes = require('./routes/bills');
const employeeRoutes = require('./routes/employees');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/employees', employeeRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Internet Banking API is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error', 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Test database connection and start server
const startServer = async () => {
  try {
    // Test database connection
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    
    console.log('✅ MySQL Database connected successfully!');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`📁 Database: ${process.env.DB_NAME}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:');
    console.error('   Error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. XAMPP MySQL is running');
    console.error('   2. Database credentials in .env are correct');
    console.error('   3. Database exists: ' + process.env.DB_NAME);
    console.error('\nExiting...\n');
    process.exit(1);
  }
};

startServer();
