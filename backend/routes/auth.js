const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validatePhone, validateEmail, validateName, validateDOB } = require('../utils/validation');

// Register new customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, address, dob } = req.body;

    // Validation
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({ 
        status: 'error', 
        message: nameValidation.message 
      });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ 
        status: 'error', 
        message: emailValidation.message 
      });
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({ 
        status: 'error', 
        message: phoneValidation.message 
      });
    }

    const dobValidation = validateDOB(dob);
    if (!dobValidation.valid) {
      return res.status(400).json({ 
        status: 'error', 
        message: dobValidation.message 
      });
    }

    
    const [existing] = await db.query(
      'SELECT CustomerID FROM customer WHERE Email = ? OR Phone = ?',
      [email, phone]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        status: 'error', 
        message: 'Email or phone number already registered' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO customer (Name, Email, Phone, Address, DOB) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, address || null, dob || null]
    );

    // account for customer
    const accountNo = 'ACC' + String(result.insertId).padStart(4, '0');
    await db.query(
      'INSERT INTO account (Account_No, Type, Balance, Status, CustomerID) VALUES (?, ?, ?, ?, ?)',
      [accountNo, 'Savings', 1000.00, 'Active', result.insertId]
    );

    res.status(201).json({ 
      status: 'success', 
      message: 'Account created successfully!',
      data: {
        customerId: result.insertId,
        name,
        phone,
        accountNo
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Registration failed' 
    });
  }
});

// Customer login
router.post('/login', async (req, res) => {
  try {
    const { phone, accountNo } = req.body;

    // Validation
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({ 
        status: 'error', 
        message: phoneValidation.message 
      });
    }

    if (!accountNo || !/^ACC\d{4}$/.test(accountNo)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid account number format' 
      });
    }

    // Find customer with account
    const [customers] = await db.query(
      `SELECT c.*, a.AccountID, a.Account_No, a.Balance, a.Type 
       FROM customer c
       INNER JOIN account a ON c.CustomerID = a.CustomerID
       WHERE c.Phone = ? AND a.Account_No = ? AND a.Status = 'Active'`,
      [phone, accountNo]
    );

    if (customers.length === 0) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid phone number or account number' 
      });
    }

    const customer = customers[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: customer.CustomerID, 
        accountId: customer.AccountID,
        phone: customer.Phone, 
        isAdmin: false 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      status: 'success', 
      message: 'Login successful',
      data: {
        token,
        customer: {
          id: customer.CustomerID,
          name: customer.Name,
          email: customer.Email,
          phone: customer.Phone,
          accountNo: customer.Account_No,
          accountType: customer.Type,
          balance: parseFloat(customer.Balance)
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Login failed' 
    });
  }
});

// Employee login (Admin)
router.post('/admin-login', async (req, res) => {
  try {
    const { employeeId, name } = req.body;

    // Validation
    if (!employeeId || !name) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Employee ID and name are required' 
      });
    }

    // Hardcoded admin credentials
    const ADMIN_CREDENTIALS = {
      id: 'admin',
      password: 'admin123'
    };

    // Check if using hardcoded admin credentials
    if (employeeId === ADMIN_CREDENTIALS.id && name === ADMIN_CREDENTIALS.password) {
      const token = jwt.sign(
        { 
          employeeId: 'admin', 
          name: 'System Administrator', 
          isAdmin: true 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({ 
        status: 'success', 
        message: 'Admin login successful',
        data: {
          token,
          employee: {
            id: 'admin',
            name: 'System Administrator',
            address: 'Head Office'
          }
        }
      });
    }

    // Otherwise, check employee table
    const [employees] = await db.query(
      'SELECT * FROM employee WHERE EmployeeID = ? AND Name = ?',
      [employeeId, name]
    );

    if (employees.length === 0) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    const employee = employees[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        employeeId: employee.EmployeeID, 
        name: employee.Name, 
        isAdmin: true 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      status: 'success', 
      message: 'Employee login successful',
      data: {
        token,
        employee: {
          id: employee.EmployeeID,
          name: employee.Name,
          address: employee.Address
        }
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Login failed' 
    });
  }
});

// Manager login
router.post('/manager-login', async (req, res) => {
  try {
    const { employeeId, name } = req.body;

    // Validation
    if (!employeeId || !name) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Employee ID and password are required' 
      });
    }

    // Hardcoded manager credentials
    const MANAGER_CREDENTIALS = {
      id: 'manager',
      password: 'manager123'
    };

    // Check if using hardcoded manager credentials
    if (employeeId === MANAGER_CREDENTIALS.id && name === MANAGER_CREDENTIALS.password) {
      const token = jwt.sign(
        { 
          employeeId: 'manager', 
          name: 'System Manager', 
          isManager: true,
          isAdmin: false
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({ 
        status: 'success', 
        message: 'Manager login successful',
        data: {
          token,
          employeeId: 'manager',
          name: 'System Manager'
        }
      });
    }

    // Otherwise, check employee table for managers
    const [employees] = await db.query(
      'SELECT * FROM employee WHERE EmployeeID = ? AND Name = ?',
      [employeeId, name]
    );

    if (employees.length === 0) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    const employee = employees[0];

    // Generate JWT token with isManager flag
    const token = jwt.sign(
      { 
        employeeId: employee.EmployeeID, 
        name: employee.Name, 
        isManager: true,
        isAdmin: false
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      status: 'success', 
      message: 'Manager login successful',
      data: {
        token,
        employeeId: employee.EmployeeID,
        name: employee.Name
      }
    });

  } catch (error) {
    console.error('Manager login error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Login failed' 
    });
  }
});

module.exports = router;
