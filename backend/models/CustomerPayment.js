const mongoose = require('mongoose');

const customerPaymentSchema = new mongoose.Schema({
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
    enum: ['cash', 'online', 'cheque'],
    required: true
  },
  chequeNumber: {
    type: String,
    trim: true,
    default: ''
  },
  transactionId: {
    type: String,
    trim: true,
    default: ''
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  invoiceNumber: {
    type: String,
    trim: true,
    default: ''
  },
  projectId: {
    type: String,
    required: true
  },
  plotNumber: {
    type: String,
    required: true,
    trim: true
  },
  paymentCategory: {
    type: String,
    enum: ['token', 'advance', 'booking', 'construction', 'development', 'clubhouse', 'final'],
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  developmentCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  clubhouseCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  constructionCharges: {
    type: Number,
    default: 0,
    min: 0
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

// Create indexes for efficient querying
customerPaymentSchema.index({ user: 1, createdAt: -1 });
customerPaymentSchema.index({ user: 1, date: -1 });
customerPaymentSchema.index({ user: 1, customerName: 1 });
customerPaymentSchema.index({ user: 1, projectId: 1 });
customerPaymentSchema.index({ user: 1, paymentCategory: 1 });
customerPaymentSchema.index({ user: 1, paymentMode: 1 });

const CustomerPayment = mongoose.model('CustomerPayment', customerPaymentSchema);

module.exports = CustomerPayment; 