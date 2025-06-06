const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Expense = require('../models/Expense');
const { auditLogger } = require('../middleware/auditLogger');

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

// Get all expenses for authenticated user with filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'date',
      sortOrder = 'desc',
      search = '',
      category = '',
      subcategory = '',
      projectId = '',
      paymentMode = '',
      employeeId = '',
      landlordId = '',
      startDate = '',
      endDate = '',
      minAmount = '',
      maxAmount = ''
    } = req.query;

    // Build filter object
    const filter = { user: req.user.userId };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (subcategory && subcategory !== 'all') {
      filter.subcategory = subcategory;
    }

    if (projectId && projectId !== 'all') {
      filter.projectId = projectId;
    }

    if (paymentMode && paymentMode !== 'all') {
      filter.paymentMode = paymentMode;
    }

    if (employeeId && employeeId !== 'all') {
      filter.employeeId = employeeId;
    }

    if (landlordId && landlordId !== 'all') {
      filter.landlordId = landlordId;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    // Build search filter
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { subcategory: { $regex: search, $options: 'i' } },
          { chequeNumber: { $regex: search, $options: 'i' } },
          { transactionId: { $regex: search, $options: 'i' } }
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
    
    const [expenses, totalCount] = await Promise.all([
      Expense.find(finalFilter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Expense.countDocuments(finalFilter)
    ]);

    // Transform the data to match frontend expectations
    const transformedExpenses = expenses.map(expense => ({
      id: expense._id.toString(),
      projectId: expense.projectId,
      amount: expense.amount,
      date: expense.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      category: expense.category,
      subcategory: expense.subcategory,
      description: expense.description,
      paymentMode: expense.paymentMode,
      chequeNumber: expense.chequeNumber,
      transactionId: expense.transactionId,
      employeeId: expense.employeeId,
      salaryMonth: expense.salaryMonth,
      overrideSalary: expense.overrideSalary,
      landlordId: expense.landlordId,
      landPurchaseAmount: expense.landPurchaseAmount,
      landDetails: expense.landDetails,
      createdAt: expense.createdAt.toISOString()
    }));

    res.json({
      expenses: transformedExpenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

// Get single expense by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const transformedExpense = {
      id: expense._id.toString(),
      projectId: expense.projectId,
      amount: expense.amount,
      date: expense.date.toISOString().split('T')[0],
      category: expense.category,
      subcategory: expense.subcategory,
      description: expense.description,
      paymentMode: expense.paymentMode,
      chequeNumber: expense.chequeNumber,
      transactionId: expense.transactionId,
      employeeId: expense.employeeId,
      salaryMonth: expense.salaryMonth,
      overrideSalary: expense.overrideSalary,
      landlordId: expense.landlordId,
      landPurchaseAmount: expense.landPurchaseAmount,
      landDetails: expense.landDetails,
      createdAt: expense.createdAt.toISOString()
    };

    res.json(transformedExpense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Error fetching expense' });
  }
});

// Create new expense
router.post('/', authenticateToken, auditLogger('expense', 'CREATE'), async (req, res) => {
  try {
    // Set entity type for audit logging
    req.auditEntityType = 'expense';
    const {
      projectId,
      amount,
      date,
      category,
      subcategory,
      description,
      paymentMode,
      chequeNumber,
      transactionId,
      employeeId,
      salaryMonth,
      overrideSalary,
      landlordId,
      landPurchaseAmount,
      landDetails
    } = req.body;

    // Validate required fields
    if (!projectId || !amount || !date || !category || !subcategory || !description || !paymentMode) {
      return res.status(400).json({
        message: 'Project ID, amount, date, category, subcategory, description, and payment mode are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: 'Amount must be greater than zero'
      });
    }

    // Create new expense
    const expense = new Expense({
      user: req.user.userId,
      projectId,
      amount: parseFloat(amount),
      date: new Date(date),
      category: category.trim(),
      subcategory: subcategory.trim(),
      description: description.trim(),
      paymentMode,
      chequeNumber: chequeNumber?.trim() || '',
      transactionId: transactionId?.trim() || '',
      employeeId: employeeId?.trim() || '',
      salaryMonth: salaryMonth?.trim() || '',
      overrideSalary: parseFloat(overrideSalary) || 0,
      landlordId: landlordId?.trim() || '',
      landPurchaseAmount: parseFloat(landPurchaseAmount) || 0,
      landDetails: landDetails?.trim() || ''
    });

    await expense.save();

    const transformedExpense = {
      id: expense._id.toString(),
      projectId: expense.projectId,
      amount: expense.amount,
      date: expense.date.toISOString().split('T')[0],
      category: expense.category,
      subcategory: expense.subcategory,
      description: expense.description,
      paymentMode: expense.paymentMode,
      chequeNumber: expense.chequeNumber,
      transactionId: expense.transactionId,
      employeeId: expense.employeeId,
      salaryMonth: expense.salaryMonth,
      overrideSalary: expense.overrideSalary,
      landlordId: expense.landlordId,
      landPurchaseAmount: expense.landPurchaseAmount,
      landDetails: expense.landDetails,
      createdAt: expense.createdAt.toISOString()
    };

    res.status(201).json({
      message: 'Expense created successfully',
      expense: transformedExpense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Error creating expense' });
  }
});

// Update expense
router.put('/:id', authenticateToken, auditLogger('expense', 'UPDATE'), async (req, res) => {
  try {
    const {
      projectId,
      amount,
      date,
      category,
      subcategory,
      description,
      paymentMode,
      chequeNumber,
      transactionId,
      employeeId,
      salaryMonth,
      overrideSalary,
      landlordId,
      landPurchaseAmount,
      landDetails
    } = req.body;

    // Find expense
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update expense fields
    if (projectId) expense.projectId = projectId;
    if (amount !== undefined && amount > 0) expense.amount = parseFloat(amount);
    if (date) expense.date = new Date(date);
    if (category) expense.category = category.trim();
    if (subcategory) expense.subcategory = subcategory.trim();
    if (description) expense.description = description.trim();
    if (paymentMode) expense.paymentMode = paymentMode;
    if (chequeNumber !== undefined) expense.chequeNumber = chequeNumber?.trim() || '';
    if (transactionId !== undefined) expense.transactionId = transactionId?.trim() || '';
    if (employeeId !== undefined) expense.employeeId = employeeId?.trim() || '';
    if (salaryMonth !== undefined) expense.salaryMonth = salaryMonth?.trim() || '';
    if (overrideSalary !== undefined) expense.overrideSalary = parseFloat(overrideSalary) || 0;
    if (landlordId !== undefined) expense.landlordId = landlordId?.trim() || '';
    if (landPurchaseAmount !== undefined) expense.landPurchaseAmount = parseFloat(landPurchaseAmount) || 0;
    if (landDetails !== undefined) expense.landDetails = landDetails?.trim() || '';

    await expense.save();

    const transformedExpense = {
      id: expense._id.toString(),
      projectId: expense.projectId,
      amount: expense.amount,
      date: expense.date.toISOString().split('T')[0],
      category: expense.category,
      subcategory: expense.subcategory,
      description: expense.description,
      paymentMode: expense.paymentMode,
      chequeNumber: expense.chequeNumber,
      transactionId: expense.transactionId,
      employeeId: expense.employeeId,
      salaryMonth: expense.salaryMonth,
      overrideSalary: expense.overrideSalary,
      landlordId: expense.landlordId,
      landPurchaseAmount: expense.landPurchaseAmount,
      landDetails: expense.landDetails,
      createdAt: expense.createdAt.toISOString()
    };

    res.json({
      message: 'Expense updated successfully',
      expense: transformedExpense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Error updating expense' });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, auditLogger('expense', 'DELETE'), async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await Expense.deleteOne({ _id: req.params.id });
    
    res.json({ 
      message: 'Expense deleted successfully',
      deletedExpense: {
        id: expense._id.toString(),
        description: expense.description,
        amount: expense.amount
      }
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Error deleting expense' });
  }
});

// Get expense statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = { user: req.user.userId };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const [
      totalExpenses,
      totalAmount,
      averageExpense,
      expensesByCategory,
      expensesBySubcategory,
      expensesByProject,
      expensesByPaymentMode,
      recentExpenses,
      monthlyStats
    ] = await Promise.all([
      Expense.countDocuments(dateFilter),
      Expense.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, average: { $avg: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$subcategory', count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$projectId', count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$paymentMode', count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]),
      Expense.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('description amount category createdAt'),
      Expense.aggregate([
        { $match: { user: req.user.userId } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            count: { $sum: 1 },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      totalExpenses,
      totalAmount: totalAmount[0]?.total || 0,
      averageExpense: averageExpense[0]?.average || 0,
      expensesByCategory: expensesByCategory.map(item => ({
        category: item._id,
        count: item.count,
        total: item.total
      })),
      expensesBySubcategory: expensesBySubcategory.map(item => ({
        subcategory: item._id,
        count: item.count,
        total: item.total
      })),
      expensesByProject: expensesByProject.map(item => ({
        projectId: item._id,
        count: item.count,
        total: item.total
      })),
      expensesByPaymentMode: expensesByPaymentMode.map(item => ({
        mode: item._id,
        count: item.count,
        total: item.total
      })),
      recentExpenses: recentExpenses.map(expense => ({
        id: expense._id.toString(),
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        createdAt: expense.createdAt.toISOString()
      })),
      monthlyStats: monthlyStats.map(stat => ({
        year: stat._id.year,
        month: stat._id.month,
        count: stat.count,
        total: stat.total
      }))
    });
  } catch (error) {
    console.error('Error getting expense statistics:', error);
    res.status(500).json({ message: 'Error getting expense statistics' });
  }
});

module.exports = router; 