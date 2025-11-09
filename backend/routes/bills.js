const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Pay bill - records in PAYMENT_SERVICE
router.post('/pay', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { billType, amount, referenceNumber } = req.body;

    // Validation
    if (!billType || !amount) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: 'Bill type and amount are required' 
      });
    }

    if (amount <= 0) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid amount' 
      });
    }

    // Get account
    const [accounts] = await connection.query(
      'SELECT * FROM account WHERE AccountID = ?',
      [req.user.accountId]
    );

    const account = accounts[0];

    // Check sufficient balance
    if (parseFloat(account.Balance) < parseFloat(amount)) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: 'Insufficient balance' 
      });
    }

    // Update account balance
    const newBalance = parseFloat(account.Balance) - parseFloat(amount);
    await connection.query(
      'UPDATE account SET Balance = ? WHERE AccountID = ?',
      [newBalance, req.user.accountId]
    );

    // Determine receiver based on bill type
    let receiver = 'Service Provider';
    if (billType.includes('Electricity')) receiver = 'DESCO';
    else if (billType.includes('Internet')) receiver = 'ISP';
    else if (billType.includes('Water')) receiver = 'WASA';
    else if (billType.includes('Gas')) receiver = 'Gas Company';
    else if (billType.includes('Education')) receiver = 'Institution';
    else if (billType.includes('Donation')) receiver = 'Charity';

    // Record in PAYMENT_SERVICE
    await connection.query(
      'INSERT INTO payment_service (AccountID, Amount, PaymentDate, Status, BillType, Receiver, Operation, PhoneNo) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)',
      [req.user.accountId, amount, 'Completed', billType, receiver, 'Debit', referenceNumber || req.user.phone]
    );

    // Record in RECORDS table
    await connection.query(
      'INSERT INTO records (Account_ID, Amount, Date, Status) VALUES (?, ?, NOW(), ?)',
      [req.user.accountId, amount, 'Completed']
    );

    await connection.commit();

    res.json({ 
      status: 'success',
      message: 'Bill paid successfully',
      data: {
        billType,
        amount: parseFloat(amount),
        newBalance,
        receiver,
        referenceNumber: referenceNumber || 'N/A'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Bill payment error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Bill payment failed' 
    });
  } finally {
    connection.release();
  }
});

// Get bill payment history from PAYMENT_SERVICE
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const [bills] = await db.query(
      `SELECT * FROM payment_service 
       WHERE AccountID = ? AND BillType NOT IN ('Deposit', 'Withdrawal', 'Transfer', 'LoanApproval', 'LoanRepayment')
       ORDER BY PaymentDate DESC LIMIT 50`,
      [req.user.accountId]
    );

    res.json({ 
      status: 'success',
      data: bills.map(bill => ({
        id: bill.PaymentID,
        billType: bill.BillType,
        amount: parseFloat(bill.Amount),
        receiver: bill.Receiver,
        referenceNumber: bill.PhoneNo,
        status: bill.Status,
        date: bill.PaymentDate
      }))
    });

  } catch (error) {
    console.error('Bill history error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch bill history' 
    });
  }
});

module.exports = router;
