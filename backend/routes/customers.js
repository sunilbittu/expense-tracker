const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

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

// Get all customers for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    
    // Transform the data to match frontend expectations
    const transformedCustomers = customers.map(customer => ({
      id: customer._id.toString(),
      name: customer.name,
      plotNumber: customer.plotNumber,
      plotSize: customer.plotSize,
      builtUpArea: customer.builtUpArea,
      projectId: customer.projectId,
      salePrice: customer.salePrice,
      pricePerYard: customer.pricePerYard,
      constructionPrice: customer.constructionPrice,
      constructionPricePerSqft: customer.constructionPricePerSqft,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      createdAt: customer.createdAt.toISOString()
    }));

    res.json(transformedCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
});

// Get single customer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const transformedCustomer = {
      id: customer._id.toString(),
      name: customer.name,
      plotNumber: customer.plotNumber,
      plotSize: customer.plotSize,
      builtUpArea: customer.builtUpArea,
      projectId: customer.projectId,
      salePrice: customer.salePrice,
      pricePerYard: customer.pricePerYard,
      constructionPrice: customer.constructionPrice,
      constructionPricePerSqft: customer.constructionPricePerSqft,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      createdAt: customer.createdAt.toISOString()
    };

    res.json(transformedCustomer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
});

// Create new customer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      plotNumber,
      plotSize,
      builtUpArea,
      projectId,
      salePrice,
      pricePerYard,
      constructionPrice,
      constructionPricePerSqft,
      phone,
      email,
      address
    } = req.body;

    // Validate required fields
    if (!name || !plotNumber || !projectId) {
      return res.status(400).json({
        message: 'Name, plot number, and project ID are required'
      });
    }

    // Check if plot number already exists for this user
    const existingCustomer = await Customer.findOne({
      user: req.user.userId,
      plotNumber: plotNumber.trim()
    });

    if (existingCustomer) {
      return res.status(400).json({
        message: 'Plot number already exists for this user'
      });
    }

    // Create new customer
    const customer = new Customer({
      name: name.trim(),
      plotNumber: plotNumber.trim(),
      plotSize: parseFloat(plotSize) || 0,
      builtUpArea: parseFloat(builtUpArea) || 0,
      projectId,
      salePrice: parseFloat(salePrice) || 0,
      pricePerYard: parseFloat(pricePerYard) || 0,
      constructionPrice: parseFloat(constructionPrice) || 0,
      constructionPricePerSqft: parseFloat(constructionPricePerSqft) || 0,
      phone: phone?.trim() || '',
      email: email?.trim() || '',
      address: address?.trim() || '',
      user: req.user.userId
    });

    await customer.save();

    const transformedCustomer = {
      id: customer._id.toString(),
      name: customer.name,
      plotNumber: customer.plotNumber,
      plotSize: customer.plotSize,
      builtUpArea: customer.builtUpArea,
      projectId: customer.projectId,
      salePrice: customer.salePrice,
      pricePerYard: customer.pricePerYard,
      constructionPrice: customer.constructionPrice,
      constructionPricePerSqft: customer.constructionPricePerSqft,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      createdAt: customer.createdAt.toISOString()
    };

    res.status(201).json({
      message: 'Customer created successfully',
      customer: transformedCustomer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Plot number already exists for this user'
      });
    }

    res.status(500).json({ message: 'Error creating customer' });
  }
});

// Update customer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      plotNumber,
      plotSize,
      builtUpArea,
      projectId,
      salePrice,
      pricePerYard,
      constructionPrice,
      constructionPricePerSqft,
      phone,
      email,
      address
    } = req.body;

    // Find customer
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if plot number is being changed and if it already exists
    if (plotNumber && plotNumber.trim() !== customer.plotNumber) {
      const existingCustomer = await Customer.findOne({
        user: req.user.userId,
        plotNumber: plotNumber.trim(),
        _id: { $ne: req.params.id }
      });

      if (existingCustomer) {
        return res.status(400).json({
          message: 'Plot number already exists for this user'
        });
      }
    }

    // Update customer fields
    if (name) customer.name = name.trim();
    if (plotNumber) customer.plotNumber = plotNumber.trim();
    if (plotSize !== undefined) customer.plotSize = parseFloat(plotSize) || 0;
    if (builtUpArea !== undefined) customer.builtUpArea = parseFloat(builtUpArea) || 0;
    if (projectId) customer.projectId = projectId;
    if (salePrice !== undefined) customer.salePrice = parseFloat(salePrice) || 0;
    if (pricePerYard !== undefined) customer.pricePerYard = parseFloat(pricePerYard) || 0;
    if (constructionPrice !== undefined) customer.constructionPrice = parseFloat(constructionPrice) || 0;
    if (constructionPricePerSqft !== undefined) customer.constructionPricePerSqft = parseFloat(constructionPricePerSqft) || 0;
    if (phone !== undefined) customer.phone = phone?.trim() || '';
    if (email !== undefined) customer.email = email?.trim() || '';
    if (address !== undefined) customer.address = address?.trim() || '';

    await customer.save();

    const transformedCustomer = {
      id: customer._id.toString(),
      name: customer.name,
      plotNumber: customer.plotNumber,
      plotSize: customer.plotSize,
      builtUpArea: customer.builtUpArea,
      projectId: customer.projectId,
      salePrice: customer.salePrice,
      pricePerYard: customer.pricePerYard,
      constructionPrice: customer.constructionPrice,
      constructionPricePerSqft: customer.constructionPricePerSqft,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      createdAt: customer.createdAt.toISOString()
    };

    res.json({
      message: 'Customer updated successfully',
      customer: transformedCustomer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Plot number already exists for this user'
      });
    }

    res.status(500).json({ message: 'Error updating customer' });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await Customer.deleteOne({ _id: req.params.id });
    
    res.json({ 
      message: 'Customer deleted successfully',
      deletedCustomer: {
        id: customer._id.toString(),
        name: customer.name,
        plotNumber: customer.plotNumber
      }
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
});

module.exports = router; 