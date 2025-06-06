const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Get all employees for authenticated user with filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      status = '',
      jobTitle = ''
    } = req.query;

    // Build filter object
    const filter = { user: req.user.userId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (jobTitle) {
      filter.jobTitle = { $regex: jobTitle, $options: 'i' };
    }

    // Build search filter
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
          { jobTitle: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Combine filters
    const finalFilter = search ? { ...filter, ...searchFilter } : filter;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [employees, totalCount] = await Promise.all([
      Employee.find(finalFilter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Employee.countDocuments(finalFilter)
    ]);

    // Transform the data to match frontend expectations
    const transformedEmployees = employees.map(employee => ({
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      name: employee.name,
      jobTitle: employee.jobTitle,
      salary: employee.salary,
      phone: employee.phone,
      email: employee.email,
      address: employee.address,
      joiningDate: employee.joiningDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: employee.status,
      createdAt: employee.createdAt.toISOString()
    }));

    res.json({
      employees: transformedEmployees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Get single employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const transformedEmployee = {
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      name: employee.name,
      jobTitle: employee.jobTitle,
      salary: employee.salary,
      phone: employee.phone,
      email: employee.email,
      address: employee.address,
      joiningDate: employee.joiningDate.toISOString().split('T')[0],
      status: employee.status,
      createdAt: employee.createdAt.toISOString()
    };

    res.json(transformedEmployee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

// Create new employee
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      employeeId,
      name,
      jobTitle,
      salary,
      phone,
      email,
      address,
      joiningDate,
      status
    } = req.body;

    // Validate required fields
    if (!employeeId || !name || !jobTitle || !phone || !address || !joiningDate) {
      return res.status(400).json({
        message: 'Employee ID, name, job title, phone, address, and joining date are required'
      });
    }

    if (salary === undefined || salary <= 0) {
      return res.status(400).json({
        message: 'Salary is required and must be greater than zero'
      });
    }

    // Check if employee ID already exists for this user
    const existingEmployee = await Employee.findOne({
      user: req.user.userId,
      employeeId: employeeId.trim()
    });

    if (existingEmployee) {
      return res.status(400).json({
        message: 'Employee ID already exists'
      });
    }

    // Create new employee
    const employee = new Employee({
      employeeId: employeeId.trim(),
      name: name.trim(),
      jobTitle: jobTitle.trim(),
      salary: parseFloat(salary),
      phone: phone.trim(),
      email: email?.trim() || '',
      address: address.trim(),
      joiningDate: new Date(joiningDate),
      status: status || 'active',
      user: req.user.userId
    });

    await employee.save();

    const transformedEmployee = {
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      name: employee.name,
      jobTitle: employee.jobTitle,
      salary: employee.salary,
      phone: employee.phone,
      email: employee.email,
      address: employee.address,
      joiningDate: employee.joiningDate.toISOString().split('T')[0],
      status: employee.status,
      createdAt: employee.createdAt.toISOString()
    };

    res.status(201).json({
      message: 'Employee created successfully',
      employee: transformedEmployee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
    
    res.status(500).json({ message: 'Error creating employee' });
  }
});

// Update employee
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      employeeId,
      name,
      jobTitle,
      salary,
      phone,
      email,
      address,
      joiningDate,
      status
    } = req.body;

    // Find employee
    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if new employee ID conflicts with existing one (if changed)
    if (employeeId && employeeId.trim() !== employee.employeeId) {
      const existingEmployee = await Employee.findOne({
        user: req.user.userId,
        employeeId: employeeId.trim(),
        _id: { $ne: req.params.id }
      });

      if (existingEmployee) {
        return res.status(400).json({
          message: 'Employee ID already exists'
        });
      }
    }

    // Update employee fields
    if (employeeId) employee.employeeId = employeeId.trim();
    if (name) employee.name = name.trim();
    if (jobTitle) employee.jobTitle = jobTitle.trim();
    if (salary !== undefined && salary > 0) employee.salary = parseFloat(salary);
    if (phone) employee.phone = phone.trim();
    if (email !== undefined) employee.email = email?.trim() || '';
    if (address) employee.address = address.trim();
    if (joiningDate) employee.joiningDate = new Date(joiningDate);
    if (status !== undefined) employee.status = status;

    await employee.save();

    const transformedEmployee = {
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      name: employee.name,
      jobTitle: employee.jobTitle,
      salary: employee.salary,
      phone: employee.phone,
      email: employee.email,
      address: employee.address,
      joiningDate: employee.joiningDate.toISOString().split('T')[0],
      status: employee.status,
      createdAt: employee.createdAt.toISOString()
    };

    res.json({
      message: 'Employee updated successfully',
      employee: transformedEmployee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
    
    res.status(500).json({ message: 'Error updating employee' });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.deleteOne({ _id: req.params.id });
    
    res.json({ 
      message: 'Employee deleted successfully',
      deletedEmployee: {
        id: employee._id.toString(),
        name: employee.name,
        employeeId: employee.employeeId
      }
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

// Get employee statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalSalaryExpense,
      averageSalary,
      recentEmployees
    ] = await Promise.all([
      Employee.countDocuments({ user: req.user.userId }),
      Employee.countDocuments({ user: req.user.userId, status: 'active' }),
      Employee.countDocuments({ user: req.user.userId, status: 'inactive' }),
      Employee.aggregate([
        { $match: { user: req.user.userId } },
        { $group: { _id: null, total: { $sum: '$salary' } } }
      ]),
      Employee.aggregate([
        { $match: { user: req.user.userId } },
        { $group: { _id: null, average: { $avg: '$salary' } } }
      ]),
      Employee.find({ user: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name jobTitle createdAt')
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalSalaryExpense: totalSalaryExpense[0]?.total || 0,
      averageSalary: averageSalary[0]?.average || 0,
      recentEmployees: recentEmployees.map(emp => ({
        id: emp._id.toString(),
        name: emp.name,
        jobTitle: emp.jobTitle,
        createdAt: emp.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error getting employee statistics:', error);
    res.status(500).json({ message: 'Error getting employee statistics' });
  }
});

module.exports = router; 