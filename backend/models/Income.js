const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ['cash', 'online', 'cheque']
  },
  chequeNumber: {
    type: String,
    trim: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  payee: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validation: Require chequeNumber when paymentMode is 'cheque'
incomeSchema.pre('save', function(next) {
  if (this.paymentMode === 'cheque' && !this.chequeNumber) {
    next(new Error('Cheque number is required when payment mode is cheque'));
  } else if (this.paymentMode === 'online' && !this.transactionId) {
    next(new Error('Transaction ID is required when payment mode is online'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Income', incomeSchema); 