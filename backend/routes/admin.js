const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Total users
    const [users] = await db.query('SELECT COUNT(*) as count FROM customer');
    
    // Total transactions
    const [transactions] = await db.query('SELECT COUNT(*) as count FROM payment_service');
    
    // Active loans
    const [loans] = await db.query(
      `SELECT COUNT(*) as count FROM repayment WHERE RemainingAmount > 0`
    );
    
    // Total system balance
    const [balance] = await db.query('SELECT SUM(Balance) as total FROM account');
    
    res.json({
      status: 'success',
      data: {
        totalUsers: users[0].count,
        totalTransactions: transactions[0].count,
        activeLoans: loans[0].count,
        totalBalance: balance[0].total || 0
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch stats' });
  }
});

// Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT c.CustomerID, c.Name, c.Phone, c.Email, a.Account_No as accountNo, 
             a.Balance as balance, a.Status
      FROM customer c
      INNER JOIN account a ON c.CustomerID = a.CustomerID
      ORDER BY c.CustomerID DESC
    `);
    
    res.json({
      status: 'success',
      data: {
        users: users.map(u => ({
          customerId: u.CustomerID,
          name: u.Name,
          phone: u.Phone,
          email: u.Email,
          accountNo: u.accountNo,
          balance: parseFloat(u.balance),
          status: u.Status
        }))
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
});

// Freeze/Unfreeze account
router.put('/users/:accountNo/freeze', authenticateAdmin, async (req, res) => {
  try {
    const { accountNo } = req.params;
    const { freeze } = req.body; // true to freeze, false to unfreeze
    
    const newStatus = freeze ? 'Frozen' : 'Active';
    
    // Update account status
    await db.query(
      'UPDATE account SET Status = ? WHERE Account_No = ?',
      [newStatus, accountNo]
    );
    
    res.json({
      status: 'success',
      message: `Account ${freeze ? 'frozen' : 'unfrozen'} successfully`,
      data: { accountNo, status: newStatus }
    });
  } catch (error) {
    console.error('Freeze account error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update account status' });
  }
});

// Approve new account
router.put('/users/:accountNo/approve', authenticateAdmin, async (req, res) => {
  try {
    const { accountNo } = req.params;
    
    // Update account status to Active
    await db.query(
      'UPDATE account SET Status = ? WHERE Account_No = ?',
      ['Active', accountNo]
    );
    
    res.json({
      status: 'success',
      message: 'Account approved successfully',
      data: { accountNo, status: 'Active' }
    });
  } catch (error) {
    console.error('Approve account error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to approve account' });
  }
});

// Delete account permanently
router.delete('/users/:accountNo', authenticateAdmin, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { accountNo } = req.params;
    
    await connection.beginTransaction();
    
    // Get AccountID and CustomerID
    const [account] = await connection.query(
      'SELECT AccountID, CustomerID FROM account WHERE Account_No = ?',
      [accountNo]
    );
    
    if (account.length === 0) {
      await connection.rollback();
      return res.status(404).json({ status: 'error', message: 'Account not found' });
    }
    
    const accountId = account[0].AccountID;
    const customerId = account[0].CustomerID;
    
    // Delete related records in order (respecting foreign key constraints)
    // 1. Delete repayments (linked to loan via takes)
    await connection.query(
      'DELETE r FROM repayment r INNER JOIN takes t ON r.LoanID = t.LoanID WHERE t.AccountID = ?',
      [accountId]
    );
    
    // 2. Delete takes records
    await connection.query('DELETE FROM takes WHERE AccountID = ?', [accountId]);
    
    // 3. Delete records table entries
    await connection.query('DELETE FROM records WHERE Account_ID = ?', [accountId]);
    
    // 4. Delete payment_service records
    await connection.query('DELETE FROM payment_service WHERE AccountID = ?', [accountId]);
    
    // 5. Delete account record
    await connection.query('DELETE FROM account WHERE AccountID = ?', [accountId]);
    
    // 6. Delete customer record
    await connection.query('DELETE FROM customer WHERE CustomerID = ?', [customerId]);
    
    await connection.commit();
    
    res.json({
      status: 'success',
      message: 'Account and all associated data deleted permanently',
      data: { accountNo }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete account error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to delete account',
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// Get all transactions
router.get('/transactions', authenticateAdmin, async (req, res) => {
  try {
    const [transactions] = await db.query(`
      SELECT ps.*, a.Account_No as accountNo
      FROM payment_service ps
      INNER JOIN account a ON ps.AccountID = a.AccountID
      ORDER BY ps.PaymentDate DESC
      LIMIT 100
    `);
    
    res.json({
      status: 'success',
      data: {
        transactions: transactions.map(tx => ({
          id: tx.PaymentID,
          accountNo: tx.accountNo,
          type: tx.BillType,
          amount: parseFloat(tx.Amount),
          operation: tx.Operation,
          status: tx.Status,
          date: tx.PaymentDate
        }))
      }
    });
  } catch (error) {
    console.error('Admin transactions error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch transactions' });
  }
});

// Get all active loans
router.get('/loans', authenticateAdmin, async (req, res) => {
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
    
    res.json({
      status: 'success',
      data: {
        loans: loans.map(loan => ({
          loanId: loan.loanId,
          accountNo: loan.accountNo,
          type: loan.Type,
          amount: parseFloat(loan.Amount),
          remaining: parseFloat(loan.RemainingAmount),
          status: loan.Status
        }))
      }
    });
  } catch (error) {
    console.error('Admin loans error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch loans' });
  }
});

module.exports = router;
