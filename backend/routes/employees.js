const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// Get all employees
router.get('/', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const [employees] = await db.query('SELECT * FROM employee ORDER BY EmployeeID');

    res.json({ 
      status: 'success',
      data: employees.map(emp => ({
        id: emp.EmployeeID,
        name: emp.Name,
        dob: emp.DOB,
        address: emp.Address
      }))
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch employees' 
    });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const [employees] = await db.query(
      'SELECT * FROM employee WHERE EmployeeID = ?',
      [req.params.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Employee not found' 
      });
    }

    const emp = employees[0];

    res.json({ 
      status: 'success',
      data: {
        id: emp.EmployeeID,
        name: emp.Name,
        dob: emp.DOB,
        address: emp.Address
      }
    });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch employee' 
    });
  }
});

// Add new employee
router.post('/', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { name, dob, address } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Name is required' 
      });
    }

    // Insert new employee
    const [result] = await db.query(
      'INSERT INTO employee (Name, DOB, Address) VALUES (?, ?, ?)',
      [name, dob || null, address || null]
    );

    res.status(201).json({ 
      status: 'success', 
      message: 'Employee added successfully',
      data: {
        employeeId: result.insertId,
        name,
        dob,
        address
      }
    });

  } catch (error) {
    console.error('Add employee error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to add employee' 
    });
  }
});

// Update employee
router.put('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { name, dob, address } = req.body;

    // Check if employee exists
    const [existing] = await db.query(
      'SELECT EmployeeID FROM employee WHERE EmployeeID = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Employee not found' 
      });
    }

    // Update employee
    await db.query(
      'UPDATE employee SET Name = ?, DOB = ?, Address = ? WHERE EmployeeID = ?',
      [name, dob || null, address || null, req.params.id]
    );

    res.json({ 
      status: 'success', 
      message: 'Employee updated successfully'
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update employee' 
    });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    // Check if employee exists
    const [existing] = await db.query(
      'SELECT EmployeeID FROM employee WHERE EmployeeID = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Employee not found' 
      });
    }

    // Delete employee
    await db.query(
      'DELETE FROM employee WHERE EmployeeID = ?',
      [req.params.id]
    );

    res.json({ 
      status: 'success', 
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to delete employee' 
    });
  }
});

module.exports = router;
