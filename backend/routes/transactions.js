const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateAmount, validateAccountNumber } = require('../utils/validation');

// Get account balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const [accounts] = await db.query(
      'SELECT Balance FROM account WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (accounts.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Account not found' 
      });
    }

    res.json({ 
      status: 'success',
      data: {
        balance: parseFloat(accounts[0].Balance)
      }
    });

  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch balance' 
    });
  }
});

// Add money
router.post('/add-money', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { amount } = req.body;

    // Validation
    const amountValidation = validateAmount(amount, 1, 100000);
    if (!amountValidation.valid) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: amountValidation.message 
      });
    }

    // Get current balance
    const [accounts] = await connection.query(
      'SELECT Balance FROM account WHERE AccountID = ?',
      [req.user.accountId]
    );

    const account = accounts[0];
    const newBalance = parseFloat(account.Balance) + parseFloat(amount);

    // Update balance
    await connection.query(
      'UPDATE account SET Balance = ? WHERE AccountID = ?',
      [newBalance, req.user.accountId]
    );

    // Record in PAYMENT_SERVICE
    await connection.query(
      'INSERT INTO payment_service (AccountID, Amount, PaymentDate, Status, BillType, Receiver, Operation, PhoneNo) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)',
      [req.user.accountId, amount, 'Completed', 'Deposit', 'Self', 'Credit', req.user.phone]
    );

    // Record in RECORDS table
    await connection.query(
      'INSERT INTO records (Account_ID, Amount, Date, Status) VALUES (?, ?, NOW(), ?)',
      [req.user.accountId, amount, 'Completed']
    );

    await connection.commit();

    res.json({ 
      status: 'success',
      message: 'Money added successfully',
      data: {
        newBalance,
        amount: parseFloat(amount)
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Add money error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Transaction failed' 
    });
  } finally {
    connection.release();
  }
});

// Cash out
router.post('/cash-out', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { amount } = req.body;

    // Validation
    const amountValidation = validateAmount(amount, 1, 100000);
    if (!amountValidation.valid) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: amountValidation.message 
      });
    }

    // Get current balance
    const [accounts] = await connection.query(
      'SELECT Balance FROM account WHERE AccountID = ?',
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

    const newBalance = parseFloat(account.Balance) - parseFloat(amount);

    // Update balance
    await connection.query(
      'UPDATE account SET Balance = ? WHERE AccountID = ?',
      [newBalance, req.user.accountId]
    );

    // Record in PAYMENT_SERVICE
    await connection.query(
      'INSERT INTO payment_service (AccountID, Amount, PaymentDate, Status, BillType, Receiver, Operation, PhoneNo) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)',
      [req.user.accountId, amount, 'Completed', 'Withdrawal', 'Cash', 'Debit', req.user.phone]
    );

    // Record in RECORDS table
    await connection.query(
      'INSERT INTO records (Account_ID, Amount, Date, Status) VALUES (?, ?, NOW(), ?)',
      [req.user.accountId, amount, 'Completed']
    );

    await connection.commit();

    res.json({ 
      status: 'success',
      message: 'Cash out successful',
      data: {
        newBalance,
        amount: parseFloat(amount)
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Cash out error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Transaction failed' 
    });
  } finally {
    connection.release();
  }
});

// Transfer money
router.post('/transfer', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { recipientAccountNo, amount, phone } = req.body;

    // Validation
    const accountValidation = validateAccountNumber(recipientAccountNo);
    if (!accountValidation.valid) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: accountValidation.message 
      });
    }

    const amountValidation = validateAmount(amount, 1, 100000);
    if (!amountValidation.valid) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: amountValidation.message 
      });
    }

    // Get sender account
    const [senderAccounts] = await connection.query(
      'SELECT * FROM account WHERE AccountID = ?',
      [req.user.accountId]
    );

    const senderAccount = senderAccounts[0];

    // Check if transferring to self
    if (senderAccount.Account_No === recipientAccountNo) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: 'Cannot transfer to yourself' 
      });
    }

    // Check sufficient balance
    if (parseFloat(senderAccount.Balance) < parseFloat(amount)) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: 'Insufficient balance' 
      });
    }

    // Get recipient account
    const [recipientAccounts] = await connection.query(
      'SELECT * FROM account WHERE Account_No = ? AND Status = "Active"',
      [recipientAccountNo]
    );

    if (recipientAccounts.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        status: 'error', 
        message: 'Recipient account not found' 
      });
    }

    const recipientAccount = recipientAccounts[0];

    // Update sender balance
    const senderNewBalance = parseFloat(senderAccount.Balance) - parseFloat(amount);
    await connection.query(
      'UPDATE account SET Balance = ? WHERE AccountID = ?',
      [senderNewBalance, senderAccount.AccountID]
    );

    // Update recipient balance
    const recipientNewBalance = parseFloat(recipientAccount.Balance) + parseFloat(amount);
    await connection.query(
      'UPDATE account SET Balance = ? WHERE AccountID = ?',
      [recipientNewBalance, recipientAccount.AccountID]
    );

    // Record sender transaction
    await connection.query(
      'INSERT INTO payment_service (AccountID, Amount, PaymentDate, Status, BillType, Receiver, Operation, PhoneNo) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)',
      [senderAccount.AccountID, amount, 'Completed', 'Transfer', recipientAccountNo, 'Debit', phone || req.user.phone]
    );

    // Record recipient transaction
    await connection.query(
      'INSERT INTO payment_service (AccountID, Amount, PaymentDate, Status, BillType, Receiver, Operation, PhoneNo) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)',
      [recipientAccount.AccountID, amount, 'Completed', 'Transfer', senderAccount.Account_No, 'Credit', phone || '']
    );

    // Record in RECORDS table for sender
    await connection.query(
      'INSERT INTO records (Account_ID, Amount, Date, Status) VALUES (?, ?, NOW(), ?)',
      [senderAccount.AccountID, amount, 'Completed']
    );

    // Record in RECORDS table for recipient
    await connection.query(
      'INSERT INTO records (Account_ID, Amount, Date, Status) VALUES (?, ?, NOW(), ?)',
      [recipientAccount.AccountID, amount, 'Completed']
    );

    await connection.commit();

    res.json({ 
      status: 'success',
      message: 'Transfer successful',
      data: {
        newBalance: senderNewBalance,
        amount: parseFloat(amount),
        recipient: recipientAccountNo
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Transfer error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Transaction failed' 
    });
  } finally {
    connection.release();
  }
});

// Get transaction history from payment_service table (better data source)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching transaction history for account:', req.user.accountId);
    
    const [transactions] = await db.query(
      `SELECT PaymentID as id, Amount, PaymentDate as date, Status, 
              BillType, Operation, Receiver as receiver
       FROM payment_service
       WHERE AccountID = ? 
       ORDER BY PaymentDate DESC 
       LIMIT 50`,
      [req.user.accountId]
    );

    console.log(`Found ${transactions.length} transactions`);
    
    res.json({ 
      status: 'success',
      data: {
        transactions: transactions.map(t => ({
          id: t.id,
          amount: parseFloat(t.Amount),
          date: t.date,
          status: t.Status,
          billType: t.BillType,
          receiver: t.receiver || 'Self',
          operation: t.Operation
        }))
      }
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

module.exports = router;
