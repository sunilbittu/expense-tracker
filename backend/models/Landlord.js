const mongoose = require('mongoose');

const landlordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
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
  properties: [{
    type: String,
    trim: true
  }],
  paymentDetails: {
    bankName: {
      type: String,
      trim: true,
      default: ''
    },
    accountNumber: {
      type: String,
      trim: true,
      default: ''
    },
    accountTitle: {
      type: String,
      trim: true,
      default: ''
    },
    preferredPaymentMethod: {
      type: String,
      trim: true,
      enum: ['bank', 'cash', 'check', 'other'],
      default: 'cash'
    }
  },
  notes: {
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

// Create index for user to improve query performance
landlordSchema.index({ user: 1, createdAt: -1 });

// Pre-save middleware to validate email format if provided
landlordSchema.pre('save', function(next) {
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

const Landlord = mongoose.model('Landlord', landlordSchema);

module.exports = Landlord;
