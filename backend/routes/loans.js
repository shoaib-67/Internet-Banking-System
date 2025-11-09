const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateLoanAmount } = require('../utils/validation');

// Get loan eligibility - check TAKES relationship
router.get('/eligibility', authenticateToken, async (req, res) => {
  try {
    // Check how many loans taken by this account
    const [loans] = await db.query(
      'SELECT COUNT(*) as count FROM takes WHERE AccountID = ?',
      [req.user.accountId]
    );

    // Check active loans
    const [activeLoans] = await db.query(
      `SELECT SUM(r.RemainingAmount) as total 
       FROM takes t
       INNER JOIN repayment r ON t.LoanID = r.LoanID
       WHERE t.AccountID = ? AND r.RemainingAmount > 0`,
      [req.user.accountId]
    );

    const loanCount = loans[0].count;
    const activeLoanBalance = parseFloat(activeLoans[0].total || 0);

    res.json({ 
      status: 'success',
      data: {
        loanCount,
        maxLoans: 3,
        activeLoanBalance,
        hasActiveLoan: activeLoanBalance > 0,
        canApply: loanCount < 3 && activeLoanBalance === 0
      }
    });

  } catch (error) {
    console.error('Loan eligibility error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to check eligibility' 
    });
  }
});

// Take loan - creates LOAN, TAKES, and REPAYMENT records
router.post('/take-loan', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { loanType, amount, duration, purpose } = req.body;

    // Validation
    if (!loanType || !duration) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: 'Loan type and duration are required' 
      });
    }

    const amountValidation = validateLoanAmount(amount);
    if (!amountValidation.valid) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: amountValidation.message 
      });
    }

    // Get account
    const [accounts] = await connection.query(
      'SELECT * FROM account WHERE AccountID = ?',
      [req.user.accountId]
    );

    const account = accounts[0];

    // Check loan count
    const [loanCount] = await connection.query(
      'SELECT COUNT(*) as count FROM takes WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (loanCount[0].count >= 3) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: 'Maximum loan limit reached (3 loans)' 
      });
    }

    // Check if account has active loan
    const [activeLoans] = await connection.query(
      `SELECT r.RemainingAmount 
       FROM takes t
       INNER JOIN repayment r ON t.LoanID = r.LoanID
       WHERE t.AccountID = ? AND r.RemainingAmount > 0`,
      [req.user.accountId]
    );

    if (activeLoans.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: 'Please pay off existing loan before taking a new one' 
      });
    }

    // Calculate interest
    let interestRate = 0;
    if (loanType.includes('Personal')) interestRate = 12.50;
    else if (loanType.includes('Business')) interestRate = 14.00;
    else if (loanType.includes('Education')) interestRate = 8.75;
    else if (loanType.includes('Home')) interestRate = 9.20;
    else if (loanType.includes('Auto')) interestRate = 10.00;

    const interestAmount = (parseFloat(amount) * interestRate) / 100;
    const totalAmount = parseFloat(amount) + interestAmount;

    // Simulate eligibility check delay (2.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Create LOAN record
    const [loanResult] = await connection.query(
      'INSERT INTO loan (Type, Status, InterestRate) VALUES (?, ?, ?)',
      [loanType, 'Approved', interestRate]
    );

    const loanId = loanResult.insertId;

    // Create TAKES relationship
    await connection.query(
      'INSERT INTO takes (AccountID, LoanID, Amount, Role, Date) VALUES (?, ?, ?, ?, NOW())',
      [req.user.accountId, loanId, amount, 'Primary Borrower']
    );

    // Update account balance
    const newBalance = parseFloat(account.Balance) + parseFloat(amount);
    await connection.query(
      'UPDATE account SET Balance = ? WHERE AccountID = ?',
      [newBalance, req.user.accountId]
    );

    // Record in PAYMENT_SERVICE
    const [paymentResult] = await connection.query(
      'INSERT INTO payment_service (AccountID, Amount, PaymentDate, Status, BillType, Receiver, Operation, PhoneNo) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)',
      [req.user.accountId, amount, 'Completed', 'LoanApproval', 'Loan Department', 'Credit', req.user.phone]
    );

    // Create REPAYMENT record
    await connection.query(
      'INSERT INTO repayment (LoanID, PaymentID, AmountPaid, RemainingAmount, PaymentDate) VALUES (?, ?, ?, ?, NOW())',
      [loanId, paymentResult.insertId, 0, totalAmount]
    );

    await connection.commit();

    res.json({ 
      status: 'success',
      message: 'Loan approved successfully',
      data: {
        loanId,
        loanType,
        loanAmount: parseFloat(amount),
        interestRate,
        interestAmount,
        totalAmount,
        duration,
        newBalance
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Take loan error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Loan application failed' 
    });
  } finally {
    connection.release();
  }
});

// Get active loan
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const [loans] = await db.query(
      `SELECT l.*, t.Amount, t.Date as TakenDate, r.RemainingAmount, r.AmountPaid
       FROM takes t
       INNER JOIN loan l ON t.LoanID = l.LoanID
       LEFT JOIN repayment r ON l.LoanID = r.LoanID
       WHERE t.AccountID = ? AND r.RemainingAmount > 0
       ORDER BY t.Date DESC LIMIT 1`,
      [req.user.accountId]
    );

    if (loans.length === 0) {
      return res.json({ 
        status: 'success',
        data: null
      });
    }

    const loan = loans[0];

    res.json({ 
      status: 'success',
      data: {
        id: loan.LoanID,
        loanType: loan.Type,
        loanAmount: parseFloat(loan.Amount),
        interestRate: parseFloat(loan.InterestRate),
        outstandingBalance: parseFloat(loan.RemainingAmount),
        amountPaid: parseFloat(loan.AmountPaid),
        status: loan.Status,
        takenDate: loan.TakenDate
      }
    });

  } catch (error) {
    console.error('Get active loan error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch loan details' 
    });
  }
});

// Pay loan - updates REPAYMENT table
router.post('/pay-loan', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { amount } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid payment amount' 
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

    // Get active loan
    const [loans] = await db.query(
      `SELECT l.*, r.RepaymentID, r.RemainingAmount, r.AmountPaid
       FROM takes t
       INNER JOIN loan l ON t.LoanID = l.LoanID
       INNER JOIN repayment r ON l.LoanID = r.LoanID
       WHERE t.AccountID = ? AND r.RemainingAmount > 0
       ORDER BY t.Date DESC LIMIT 1`,
      [req.user.accountId]
    );

    if (loans.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        status: 'error', 
        message: 'No active loan found' 
      });
    }

    const loan = loans[0];

    // Check payment amount
    if (parseFloat(amount) > parseFloat(loan.RemainingAmount)) {
      await connection.rollback();
      return res.status(400).json({ 
        status: 'error', 
        message: `Payment amount exceeds outstanding balance (₹${loan.RemainingAmount})` 
      });
    }

    // Update account balance
    const newBalance = parseFloat(account.Balance) - parseFloat(amount);
    await connection.query(
      'UPDATE account SET Balance = ? WHERE AccountID = ?',
      [newBalance, req.user.accountId]
    );

    // Update repayment record
    const newRemainingAmount = parseFloat(loan.RemainingAmount) - parseFloat(amount);
    const newAmountPaid = parseFloat(loan.AmountPaid) + parseFloat(amount);
    
    await connection.query(
      'UPDATE repayment SET AmountPaid = ?, RemainingAmount = ?, PaymentDate = NOW() WHERE RepaymentID = ?',
      [newAmountPaid, newRemainingAmount, loan.RepaymentID]
    );

    // Update loan status if fully paid
    if (newRemainingAmount === 0) {
      await connection.query(
        'UPDATE loan SET Status = ? WHERE LoanID = ?',
        ['Paid', loan.LoanID]
      );
    }

    // Record in PAYMENT_SERVICE
    await connection.query(
      'INSERT INTO payment_service (AccountID, Amount, PaymentDate, Status, BillType, Receiver, Operation, PhoneNo) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)',
      [req.user.accountId, amount, 'Completed', 'LoanRepayment', 'Loan Department', 'Debit', req.user.phone]
    );

    await connection.commit();

    res.json({ 
      status: 'success',
      message: newRemainingAmount === 0 ? 'Loan fully paid off!' : 'Loan payment successful',
      data: {
        paidAmount: parseFloat(amount),
        remainingBalance: newRemainingAmount,
        newBalance,
        loanStatus: newRemainingAmount === 0 ? 'Paid' : 'Active'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Pay loan error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Payment failed' 
    });
  } finally {
    connection.release();
  }
});

// Get loan history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const [loans] = await db.query(
      `SELECT l.*, t.Amount, t.Date as TakenDate, t.Role, r.RemainingAmount, r.AmountPaid
       FROM takes t
       INNER JOIN loan l ON t.LoanID = l.LoanID
       LEFT JOIN repayment r ON l.LoanID = r.LoanID
       WHERE t.AccountID = ?
       ORDER BY t.Date DESC`,
      [req.user.accountId]
    );

    res.json({ 
      status: 'success',
      data: loans.map(loan => ({
        id: loan.LoanID,
        loanType: loan.Type,
        loanAmount: parseFloat(loan.Amount),
        interestRate: parseFloat(loan.InterestRate),
        outstandingBalance: parseFloat(loan.RemainingAmount || 0),
        amountPaid: parseFloat(loan.AmountPaid || 0),
        status: loan.Status,
        role: loan.Role,
        takenDate: loan.TakenDate
      }))
    });

  } catch (error) {
    console.error('Loan history error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch loan history' 
    });
  }
});

module.exports = router;
