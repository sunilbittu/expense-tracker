const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Landlord = require('../models/Landlord');

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
// Get all landlords for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const landlords = await Landlord.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    
    // Transform the data to match frontend expectations
    const transformedLandlords = landlords.map(landlord => ({
      id: landlord._id.toString(),
      name: landlord.name,
      amount: landlord.amount,
      pricePerAcre: landlord.pricePerAcre,
      totalExtent: landlord.totalExtent,
      totalLandPrice: landlord.totalLandPrice,
      status: landlord.status,
      phone: landlord.phone,
      email: landlord.email,
      address: landlord.address,
      properties: landlord.properties,
      paymentDetails: {
        bankName: landlord.paymentDetails.bankName,
        accountNumber: landlord.paymentDetails.accountNumber,
        accountTitle: landlord.paymentDetails.accountTitle,
        preferredPaymentMethod: landlord.paymentDetails.preferredPaymentMethod
      },
      notes: landlord.notes,
      createdAt: landlord.createdAt.toISOString()
    }));

    res.json(transformedLandlords);
  } catch (error) {
    console.error('Error fetching landlords:', error);
    res.status(500).json({ message: 'Error fetching landlords' });
  }
});
// Get single landlord by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const landlord = await Landlord.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!landlord) {
      return res.status(404).json({ message: 'Landlord not found' });
    }

    const transformedLandlord = {
      id: landlord._id.toString(),
      name: landlord.name,
      amount: landlord.amount,
      pricePerAcre: landlord.pricePerAcre,
      totalExtent: landlord.totalExtent,
      totalLandPrice: landlord.totalLandPrice,
      status: landlord.status,
      phone: landlord.phone,
      email: landlord.email,
      address: landlord.address,
      properties: landlord.properties,
      paymentDetails: {
        bankName: landlord.paymentDetails.bankName,
        accountNumber: landlord.paymentDetails.accountNumber,
        accountTitle: landlord.paymentDetails.accountTitle,
        preferredPaymentMethod: landlord.paymentDetails.preferredPaymentMethod
      },
      notes: landlord.notes,
      createdAt: landlord.createdAt.toISOString()
    };

    res.json(transformedLandlord);
  } catch (error) {
    console.error('Error fetching landlord:', error);
    res.status(500).json({ message: 'Error fetching landlord' });
  }
});
// Create new landlord
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      amount,
      pricePerAcre,
      totalExtent,
      totalLandPrice,
      status,
      phone,
      email,
      address,
      properties,
      paymentDetails,
      notes
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        message: 'Name is required'
      });
    }


    // Create new landlord
    const landlord = new Landlord({
      name: name.trim(),
      amount: amount || 0,
      pricePerAcre,
      totalExtent,
      totalLandPrice: totalLandPrice || (pricePerAcre * totalExtent),
      status: status || 'active',
      phone: phone?.trim() || '',
      email: email?.trim() || '',
      address: address?.trim() || '',
      properties: Array.isArray(properties) ? properties : [],
      paymentDetails: {
        bankName: paymentDetails?.bankName?.trim() || '',
        accountNumber: paymentDetails?.accountNumber?.trim() || '',
        accountTitle: paymentDetails?.accountTitle?.trim() || '',
        preferredPaymentMethod: paymentDetails?.preferredPaymentMethod || 'cash'
      },
      notes: notes?.trim() || '',
      user: req.user.userId
    });

    await landlord.save();

    const transformedLandlord = {
      id: landlord._id.toString(),
      name: landlord.name,
      amount: landlord.amount,
      pricePerAcre: landlord.pricePerAcre,
      totalExtent: landlord.totalExtent,
      totalLandPrice: landlord.totalLandPrice,
      status: landlord.status,
      phone: landlord.phone,
      email: landlord.email,
      address: landlord.address,
      properties: landlord.properties,
      paymentDetails: {
        bankName: landlord.paymentDetails.bankName,
        accountNumber: landlord.paymentDetails.accountNumber,
        accountTitle: landlord.paymentDetails.accountTitle,
        preferredPaymentMethod: landlord.paymentDetails.preferredPaymentMethod
      },
      notes: landlord.notes,
      createdAt: landlord.createdAt.toISOString()
    };

    res.status(201).json({
      message: 'Landlord created successfully',
      landlord: transformedLandlord
    });
  } catch (error) {
    console.error('Error creating landlord:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Error creating landlord' });
  }
});
// Update landlord
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      amount,
      pricePerAcre,
      totalExtent,
      status,
      phone,
      email,
      address,
      properties,
      paymentDetails,
      notes
    } = req.body;

    // Find landlord
    const landlord = await Landlord.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!landlord) {
      return res.status(404).json({ message: 'Landlord not found' });
    }

    // Update landlord fields
    if (name) landlord.name = name.trim();
    if (amount !== undefined) landlord.amount = amount;
    
    // Update price per acre and total extent if provided
    let recalculateTotalPrice = false;
    if (pricePerAcre !== undefined && pricePerAcre > 0) {
      landlord.pricePerAcre = pricePerAcre;
      recalculateTotalPrice = true;
    }
    if (totalExtent !== undefined && totalExtent > 0) {
      landlord.totalExtent = totalExtent;
      recalculateTotalPrice = true;
    }
    
    // Recalculate total land price if either price per acre or total extent changed
    if (recalculateTotalPrice) {
      landlord.totalLandPrice = landlord.pricePerAcre * landlord.totalExtent;
    }
    
    if (status !== undefined) landlord.status = status;
    if (phone !== undefined) landlord.phone = phone?.trim() || '';
    if (email !== undefined) landlord.email = email?.trim() || '';
    if (address !== undefined) landlord.address = address?.trim() || '';
    if (Array.isArray(properties)) landlord.properties = properties;
    if (paymentDetails) {
      if (paymentDetails.bankName !== undefined) landlord.paymentDetails.bankName = paymentDetails.bankName?.trim() || '';
      if (paymentDetails.accountNumber !== undefined) landlord.paymentDetails.accountNumber = paymentDetails.accountNumber?.trim() || '';
      if (paymentDetails.accountTitle !== undefined) landlord.paymentDetails.accountTitle = paymentDetails.accountTitle?.trim() || '';
      if (paymentDetails.preferredPaymentMethod !== undefined) landlord.paymentDetails.preferredPaymentMethod = paymentDetails.preferredPaymentMethod;
    }
    if (notes !== undefined) landlord.notes = notes?.trim() || '';

    await landlord.save();

    const transformedLandlord = {
      id: landlord._id.toString(),
      name: landlord.name,
      amount: landlord.amount,
      pricePerAcre: landlord.pricePerAcre,
      totalExtent: landlord.totalExtent,
      totalLandPrice: landlord.totalLandPrice,
      status: landlord.status,
      phone: landlord.phone,
      email: landlord.email,
      address: landlord.address,
      properties: landlord.properties,
      paymentDetails: {
        bankName: landlord.paymentDetails.bankName,
        accountNumber: landlord.paymentDetails.accountNumber,
        accountTitle: landlord.paymentDetails.accountTitle,
        preferredPaymentMethod: landlord.paymentDetails.preferredPaymentMethod
      },
      notes: landlord.notes,
      createdAt: landlord.createdAt.toISOString()
    };

    res.json({
      message: 'Landlord updated successfully',
      landlord: transformedLandlord
    });
  } catch (error) {
    console.error('Error updating landlord:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Error updating landlord' });
  }
});
// Delete landlord
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const landlord = await Landlord.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!landlord) {
      return res.status(404).json({ message: 'Landlord not found' });
    }

    await Landlord.deleteOne({ _id: req.params.id });
    
    res.json({ 
      message: 'Landlord deleted successfully',
      deletedLandlord: {
        id: landlord._id.toString(),
        name: landlord.name
      }
    });
  } catch (error) {
    console.error('Error deleting landlord:', error);
    res.status(500).json({ message: 'Error deleting landlord' });
  }
});

module.exports = router;
