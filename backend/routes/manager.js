const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateManager } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateManager);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const [usersCount] = await db.query('SELECT COUNT(*) as count FROM customer');
    
    // Get total transactions
    const [transactionsCount] = await db.query('SELECT COUNT(*) as count FROM payment_service');
    
    // Get active loans
    const [loansCount] = await db.query(
      'SELECT COUNT(*) as count FROM repayment WHERE RemainingAmount > 0'
    );
    
    // Get total balance
    const [balanceSum] = await db.query('SELECT SUM(Balance) as total FROM account');

    res.json({
      status: 'success',
      data: {
        totalUsers: usersCount[0].count,
        totalTransactions: transactionsCount[0].count,
        activeLoans: loansCount[0].count,
        totalBalance: balanceSum[0].total || 0
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics'
    });
  }
});

// Get all users (view only)
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        c.CustomerID,
        c.Name,
        c.Phone,
        a.Account_No,
        a.Balance
      FROM customer c
      INNER JOIN account a ON c.CustomerID = a.CustomerID
      WHERE a.Status = 'Active'
      ORDER BY c.CustomerID DESC
    `);

    const formattedUsers = users.map(user => ({
      customerId: user.CustomerID,
      name: user.Name,
      phone: user.Phone,
      accountNo: user.Account_No,
      balance: parseFloat(user.Balance)
    }));

    res.json({
      status: 'success',
      data: {
        users: formattedUsers
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

// Get all transactions (view only)
router.get('/transactions', async (req, res) => {
  try {
    const [transactions] = await db.query(`
      SELECT 
        ps.PaymentID,
        ps.PaymentDate,
        ps.Amount,
        ps.Receiver,
        ps.BillType,
        ps.Status,
        a.Account_No
      FROM payment_service ps
      INNER JOIN account a ON ps.AccountID = a.AccountID
      ORDER BY ps.PaymentDate DESC
      LIMIT 100
    `);

    const formattedTransactions = transactions.map(tx => ({
      paymentId: tx.PaymentID,
      date: tx.PaymentDate,
      accountNo: tx.Account_No,
      type: tx.BillType,
      amount: parseFloat(tx.Amount),
      operation: tx.BillType === 'Deposit' || tx.BillType === 'LoanApproval' ? 'Credit' : 'Debit',
      status: tx.Status
    }));

    res.json({
      status: 'success',
      data: {
        transactions: formattedTransactions
      }
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transactions'
    });
  }
});

// Get all loans (view only)
router.get('/loans', async (req, res) => {
  try {
    const [loans] = await db.query(`
      SELECT l.LoanID as loanId, l.Type, t.Amount, r.RemainingAmount, 
             l.Status, a.Account_No as accountNo
      FROM loan l
      INNER JOIN takes t ON l.LoanID = t.LoanID
      INNER JOIN account a ON t.AccountID = a.AccountID
      INNER JOIN repayment r ON l.LoanID = r.LoanID
      WHERE r.RemainingAmount > 0
      ORDER BY t.Date DESC
    `);

    const formattedLoans = loans.map(loan => ({
      loanId: loan.loanId,
      accountNo: loan.accountNo,
      type: loan.Type,
      amount: parseFloat(loan.Amount),
      remaining: parseFloat(loan.RemainingAmount),
      status: loan.Status
    }));

    res.json({
      status: 'success',
      data: {
        loans: formattedLoans
      }
    });
  } catch (error) {
    console.error('Loans fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch loans'
    });
  }
});

module.exports = router;
