const express = require('express');
const router = express.Router();
const Income = require('../models/Income');

// @route   GET /api/incomes
// @desc    Get all incomes with optional filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'date',
      sortOrder = 'desc',
      search,
      paymentMode,
      source,
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;

    // Build filter object
    const filter = {};

    // Search in description, source, and payee
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { payee: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by payment mode
    if (paymentMode) {
      filter.paymentMode = paymentMode;
    }

    // Filter by source
    if (source) {
      filter.source = { $regex: source, $options: 'i' };
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

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [incomes, total] = await Promise.all([
      Income.find(filter)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit)),
      Income.countDocuments(filter)
    ]);

    // Calculate summary statistics
    const stats = await Income.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          count: { $sum: 1 },
          paymentModeStats: {
            $push: {
              paymentMode: '$paymentMode',
              amount: '$amount'
            }
          }
        }
      }
    ]);

    // Group payment mode statistics
    const paymentModeBreakdown = {};
    if (stats.length > 0) {
      stats[0].paymentModeStats.forEach(item => {
        paymentModeBreakdown[item.paymentMode] = 
          (paymentModeBreakdown[item.paymentMode] || 0) + item.amount;
      });
    }

    res.json({
      incomes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      summary: {
        totalAmount: stats[0]?.totalAmount || 0,
        averageAmount: stats[0]?.averageAmount || 0,
        count: stats[0]?.count || 0,
        paymentModeBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ 
      message: 'Failed to fetch incomes',
      error: error.message 
    });
  }
});

// @route   GET /api/incomes/:id
// @desc    Get income by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid income ID format' });
    }
    res.status(500).json({ 
      message: 'Failed to fetch income',
      error: error.message 
    });
  }
});

// @route   POST /api/incomes
// @desc    Create new income
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      amount,
      date,
      description,
      paymentMode,
      chequeNumber,
      transactionId,
      source,
      payee
    } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (!source || !source.trim()) {
      return res.status(400).json({ message: 'Source is required' });
    }

    if (!payee || !payee.trim()) {
      return res.status(400).json({ message: 'Payee name is required' });
    }

    if (!['cash', 'online', 'cheque'].includes(paymentMode)) {
      return res.status(400).json({ message: 'Invalid payment mode' });
    }

    if (paymentMode === 'cheque' && (!chequeNumber || !chequeNumber.trim())) {
      return res.status(400).json({ message: 'Cheque number is required for cheque payments' });
    }

    if (paymentMode === 'online' && (!transactionId || !transactionId.trim())) {
      return res.status(400).json({ message: 'Transaction ID is required for online payments' });
    }

    // Create income
    const income = new Income({
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      description: description.trim(),
      paymentMode,
      chequeNumber: paymentMode === 'cheque' ? chequeNumber?.trim() : undefined,
      transactionId: paymentMode === 'online' ? transactionId?.trim() : undefined,
      source: source.trim(),
      payee: payee.trim()
    });

    const savedIncome = await income.save();
    res.status(201).json(savedIncome);
  } catch (error) {
    console.error('Error creating income:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    res.status(500).json({ 
      message: 'Failed to create income',
      error: error.message 
    });
  }
});

// @route   PUT /api/incomes/:id
// @desc    Update income
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const {
      amount,
      date,
      description,
      paymentMode,
      chequeNumber,
      transactionId,
      source,
      payee
    } = req.body;

    // Check if income exists
    const existingIncome = await Income.findById(req.params.id);
    if (!existingIncome) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // Validation
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    if (description !== undefined && (!description || !description.trim())) {
      return res.status(400).json({ message: 'Description cannot be empty' });
    }

    if (source !== undefined && (!source || !source.trim())) {
      return res.status(400).json({ message: 'Source cannot be empty' });
    }

    if (payee !== undefined && (!payee || !payee.trim())) {
      return res.status(400).json({ message: 'Payee name cannot be empty' });
    }

    if (paymentMode && !['cash', 'online', 'cheque'].includes(paymentMode)) {
      return res.status(400).json({ message: 'Invalid payment mode' });
    }

    // Prepare update object
    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (date !== undefined) updateData.date = new Date(date);
    if (description !== undefined) updateData.description = description.trim();
    if (paymentMode !== undefined) updateData.paymentMode = paymentMode;
    if (source !== undefined) updateData.source = source.trim();
    if (payee !== undefined) updateData.payee = payee.trim();

    // Handle payment mode specific fields
    const finalPaymentMode = paymentMode || existingIncome.paymentMode;
    
    if (finalPaymentMode === 'cheque') {
      if (chequeNumber !== undefined) {
        if (!chequeNumber || !chequeNumber.trim()) {
          return res.status(400).json({ message: 'Cheque number is required for cheque payments' });
        }
        updateData.chequeNumber = chequeNumber.trim();
      }
      updateData.transactionId = undefined;
    } else if (finalPaymentMode === 'online') {
      if (transactionId !== undefined) {
        if (!transactionId || !transactionId.trim()) {
          return res.status(400).json({ message: 'Transaction ID is required for online payments' });
        }
        updateData.transactionId = transactionId.trim();
      }
      updateData.chequeNumber = undefined;
    } else {
      updateData.chequeNumber = undefined;
      updateData.transactionId = undefined;
    }

    const updatedIncome = await Income.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedIncome);
  } catch (error) {
    console.error('Error updating income:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid income ID format' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    res.status(500).json({ 
      message: 'Failed to update income',
      error: error.message 
    });
  }
});

// @route   DELETE /api/incomes/:id
// @desc    Delete income
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    await Income.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Income deleted successfully',
      deletedIncome: income 
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid income ID format' });
    }
    res.status(500).json({ 
      message: 'Failed to delete income',
      error: error.message 
    });
  }
});

// @route   GET /api/incomes/sources/unique
// @desc    Get unique income sources for filtering
// @access  Public
router.get('/sources/unique', async (req, res) => {
  try {
    const sources = await Income.distinct('source');
    res.json(sources.filter(source => source && source.trim()));
  } catch (error) {
    console.error('Error fetching unique sources:', error);
    res.status(500).json({ 
      message: 'Failed to fetch income sources',
      error: error.message 
    });
  }
});

// @route   GET /api/incomes/stats/summary
// @desc    Get income summary statistics
// @access  Public
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build filter for date range
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const stats = await Income.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          count: { $sum: 1 },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' }
        }
      }
    ]);

    // Get monthly breakdown
    const monthlyStats = await Income.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get payment mode breakdown
    const paymentModeStats = await Income.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMode',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        totalAmount: 0,
        averageAmount: 0,
        count: 0,
        maxAmount: 0,
        minAmount: 0
      },
      monthlyBreakdown: monthlyStats,
      paymentModeBreakdown: paymentModeStats
    });
  } catch (error) {
    console.error('Error fetching income statistics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch income statistics',
      error: error.message 
    });
  }
});

module.exports = router; 