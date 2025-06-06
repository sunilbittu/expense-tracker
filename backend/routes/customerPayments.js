const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const CustomerPayment = require('../models/CustomerPayment');

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

// Get all customer payments for authenticated user with filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'date',
      sortOrder = 'desc',
      search = '',
      paymentMode = '',
      paymentCategory = '',
      projectId = '',
      customerName = '',
      startDate = '',
      endDate = '',
      minAmount = '',
      maxAmount = ''
    } = req.query;

    // Build filter object
    const filter = { user: req.user.userId };

    if (paymentMode && paymentMode !== 'all') {
      filter.paymentMode = paymentMode;
    }

    if (paymentCategory && paymentCategory !== 'all') {
      filter.paymentCategory = paymentCategory;
    }

    if (projectId && projectId !== 'all') {
      filter.projectId = projectId;
    }

    if (customerName) {
      filter.customerName = { $regex: customerName, $options: 'i' };
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
          { customerName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { plotNumber: { $regex: search, $options: 'i' } },
          { invoiceNumber: { $regex: search, $options: 'i' } },
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
    
    const [payments, totalCount] = await Promise.all([
      CustomerPayment.find(finalFilter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      CustomerPayment.countDocuments(finalFilter)
    ]);

    // Transform the data to match frontend expectations
    const transformedPayments = payments.map(payment => ({
      id: payment._id.toString(),
      amount: payment.amount,
      date: payment.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      description: payment.description,
      paymentMode: payment.paymentMode,
      chequeNumber: payment.chequeNumber,
      transactionId: payment.transactionId,
      customerName: payment.customerName,
      invoiceNumber: payment.invoiceNumber,
      projectId: payment.projectId,
      plotNumber: payment.plotNumber,
      paymentCategory: payment.paymentCategory,
      totalPrice: payment.totalPrice,
      developmentCharges: payment.developmentCharges,
      clubhouseCharges: payment.clubhouseCharges,
      constructionCharges: payment.constructionCharges,
      createdAt: payment.createdAt.toISOString()
    }));

    res.json({
      payments: transformedPayments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({ message: 'Error fetching customer payments' });
  }
});

// Get single customer payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await CustomerPayment.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!payment) {
      return res.status(404).json({ message: 'Customer payment not found' });
    }

    const transformedPayment = {
      id: payment._id.toString(),
      amount: payment.amount,
      date: payment.date.toISOString().split('T')[0],
      description: payment.description,
      paymentMode: payment.paymentMode,
      chequeNumber: payment.chequeNumber,
      transactionId: payment.transactionId,
      customerName: payment.customerName,
      invoiceNumber: payment.invoiceNumber,
      projectId: payment.projectId,
      plotNumber: payment.plotNumber,
      paymentCategory: payment.paymentCategory,
      totalPrice: payment.totalPrice,
      developmentCharges: payment.developmentCharges,
      clubhouseCharges: payment.clubhouseCharges,
      constructionCharges: payment.constructionCharges,
      createdAt: payment.createdAt.toISOString()
    };

    res.json(transformedPayment);
  } catch (error) {
    console.error('Error fetching customer payment:', error);
    res.status(500).json({ message: 'Error fetching customer payment' });
  }
});

// Create new customer payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      date,
      description,
      paymentMode,
      chequeNumber,
      transactionId,
      customerName,
      invoiceNumber,
      projectId,
      plotNumber,
      paymentCategory,
      totalPrice,
      developmentCharges,
      clubhouseCharges,
      constructionCharges
    } = req.body;

    // Validate required fields
    if (!amount || !date || !description || !paymentMode || !customerName || !projectId || !plotNumber || !paymentCategory || !totalPrice) {
      return res.status(400).json({
        message: 'Amount, date, description, payment mode, customer name, project ID, plot number, payment category, and total price are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: 'Amount must be greater than zero'
      });
    }

    if (totalPrice <= 0) {
      return res.status(400).json({
        message: 'Total price must be greater than zero'
      });
    }

    // Create new customer payment
    const payment = new CustomerPayment({
      amount: parseFloat(amount),
      date: new Date(date),
      description: description.trim(),
      paymentMode,
      chequeNumber: chequeNumber?.trim() || '',
      transactionId: transactionId?.trim() || '',
      customerName: customerName.trim(),
      invoiceNumber: invoiceNumber?.trim() || '',
      projectId,
      plotNumber: plotNumber.trim(),
      paymentCategory,
      totalPrice: parseFloat(totalPrice),
      developmentCharges: parseFloat(developmentCharges) || 0,
      clubhouseCharges: parseFloat(clubhouseCharges) || 0,
      constructionCharges: parseFloat(constructionCharges) || 0,
      user: req.user.userId
    });

    await payment.save();

    const transformedPayment = {
      id: payment._id.toString(),
      amount: payment.amount,
      date: payment.date.toISOString().split('T')[0],
      description: payment.description,
      paymentMode: payment.paymentMode,
      chequeNumber: payment.chequeNumber,
      transactionId: payment.transactionId,
      customerName: payment.customerName,
      invoiceNumber: payment.invoiceNumber,
      projectId: payment.projectId,
      plotNumber: payment.plotNumber,
      paymentCategory: payment.paymentCategory,
      totalPrice: payment.totalPrice,
      developmentCharges: payment.developmentCharges,
      clubhouseCharges: payment.clubhouseCharges,
      constructionCharges: payment.constructionCharges,
      createdAt: payment.createdAt.toISOString()
    };

    res.status(201).json({
      message: 'Customer payment created successfully',
      payment: transformedPayment
    });
  } catch (error) {
    console.error('Error creating customer payment:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Error creating customer payment' });
  }
});

// Update customer payment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      date,
      description,
      paymentMode,
      chequeNumber,
      transactionId,
      customerName,
      invoiceNumber,
      projectId,
      plotNumber,
      paymentCategory,
      totalPrice,
      developmentCharges,
      clubhouseCharges,
      constructionCharges
    } = req.body;

    // Find payment
    const payment = await CustomerPayment.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!payment) {
      return res.status(404).json({ message: 'Customer payment not found' });
    }

    // Update payment fields
    if (amount !== undefined && amount > 0) payment.amount = parseFloat(amount);
    if (date) payment.date = new Date(date);
    if (description) payment.description = description.trim();
    if (paymentMode) payment.paymentMode = paymentMode;
    if (chequeNumber !== undefined) payment.chequeNumber = chequeNumber?.trim() || '';
    if (transactionId !== undefined) payment.transactionId = transactionId?.trim() || '';
    if (customerName) payment.customerName = customerName.trim();
    if (invoiceNumber !== undefined) payment.invoiceNumber = invoiceNumber?.trim() || '';
    if (projectId) payment.projectId = projectId;
    if (plotNumber) payment.plotNumber = plotNumber.trim();
    if (paymentCategory) payment.paymentCategory = paymentCategory;
    if (totalPrice !== undefined && totalPrice > 0) payment.totalPrice = parseFloat(totalPrice);
    if (developmentCharges !== undefined) payment.developmentCharges = parseFloat(developmentCharges) || 0;
    if (clubhouseCharges !== undefined) payment.clubhouseCharges = parseFloat(clubhouseCharges) || 0;
    if (constructionCharges !== undefined) payment.constructionCharges = parseFloat(constructionCharges) || 0;

    await payment.save();

    const transformedPayment = {
      id: payment._id.toString(),
      amount: payment.amount,
      date: payment.date.toISOString().split('T')[0],
      description: payment.description,
      paymentMode: payment.paymentMode,
      chequeNumber: payment.chequeNumber,
      transactionId: payment.transactionId,
      customerName: payment.customerName,
      invoiceNumber: payment.invoiceNumber,
      projectId: payment.projectId,
      plotNumber: payment.plotNumber,
      paymentCategory: payment.paymentCategory,
      totalPrice: payment.totalPrice,
      developmentCharges: payment.developmentCharges,
      clubhouseCharges: payment.clubhouseCharges,
      constructionCharges: payment.constructionCharges,
      createdAt: payment.createdAt.toISOString()
    };

    res.json({
      message: 'Customer payment updated successfully',
      payment: transformedPayment
    });
  } catch (error) {
    console.error('Error updating customer payment:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Error updating customer payment' });
  }
});

// Delete customer payment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await CustomerPayment.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!payment) {
      return res.status(404).json({ message: 'Customer payment not found' });
    }

    await CustomerPayment.deleteOne({ _id: req.params.id });
    
    res.json({ 
      message: 'Customer payment deleted successfully',
      deletedPayment: {
        id: payment._id.toString(),
        customerName: payment.customerName,
        amount: payment.amount
      }
    });
  } catch (error) {
    console.error('Error deleting customer payment:', error);
    res.status(500).json({ message: 'Error deleting customer payment' });
  }
});

// Get customer payment statistics
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
      totalPayments,
      totalAmount,
      averagePayment,
      paymentsByCategory,
      paymentsByMode,
      recentPayments,
      monthlyStats
    ] = await Promise.all([
      CustomerPayment.countDocuments(dateFilter),
      CustomerPayment.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      CustomerPayment.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, average: { $avg: '$amount' } } }
      ]),
      CustomerPayment.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$paymentCategory', count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]),
      CustomerPayment.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$paymentMode', count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]),
      CustomerPayment.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('customerName amount paymentCategory createdAt'),
      CustomerPayment.aggregate([
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
      totalPayments,
      totalAmount: totalAmount[0]?.total || 0,
      averagePayment: averagePayment[0]?.average || 0,
      paymentsByCategory: paymentsByCategory.map(item => ({
        category: item._id,
        count: item.count,
        total: item.total
      })),
      paymentsByMode: paymentsByMode.map(item => ({
        mode: item._id,
        count: item.count,
        total: item.total
      })),
      recentPayments: recentPayments.map(payment => ({
        id: payment._id.toString(),
        customerName: payment.customerName,
        amount: payment.amount,
        paymentCategory: payment.paymentCategory,
        createdAt: payment.createdAt.toISOString()
      })),
      monthlyStats: monthlyStats.map(stat => ({
        year: stat._id.year,
        month: stat._id.month,
        count: stat.count,
        total: stat.total
      }))
    });
  } catch (error) {
    console.error('Error getting customer payment statistics:', error);
    res.status(500).json({ message: 'Error getting customer payment statistics' });
  }
});

module.exports = router; 