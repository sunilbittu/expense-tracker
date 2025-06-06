const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true
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
  // Employee-related fields (for salary expenses)
  employeeId: {
    type: String,
    trim: true,
    default: ''
  },
  salaryMonth: {
    type: String,
    trim: true,
    default: ''
  },
  overrideSalary: {
    type: Number,
    min: 0,
    default: 0
  },
  // Landlord-related fields (for land purchase expenses)
  landlordId: {
    type: String,
    trim: true,
    default: ''
  },
  landPurchaseAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  landDetails: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ user: 1, subcategory: 1 });
expenseSchema.index({ user: 1, projectId: 1 });
expenseSchema.index({ user: 1, paymentMode: 1 });
expenseSchema.index({ user: 1, employeeId: 1 });
expenseSchema.index({ user: 1, landlordId: 1 });
expenseSchema.index({ user: 1, createdAt: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense; 