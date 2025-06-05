const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  plotNumber: {
    type: String,
    required: true,
    trim: true
  },
  plotSize: {
    type: Number,
    required: true,
    min: 0
  },
  builtUpArea: {
    type: Number,
    required: true,
    min: 0
  },
  projectId: {
    type: String,
    required: true
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerYard: {
    type: Number,
    required: true,
    min: 0
  },
  constructionPrice: {
    type: Number,
    required: true,
    min: 0
  },
  constructionPricePerSqft: {
    type: Number,
    required: true,
    min: 0
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for user and plotNumber to ensure unique plot numbers per user
customerSchema.index({ user: 1, plotNumber: 1 }, { unique: true });

// Create index for user to improve query performance
customerSchema.index({ user: 1, createdAt: -1 });

// Pre-save middleware to validate email format if provided
customerSchema.pre('save', function(next) {
  if (this.email && this.email.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      const error = new Error('Invalid email format');
      error.status = 400;
      return next(error);
    }
  }
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 