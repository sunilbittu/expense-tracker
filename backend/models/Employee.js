const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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

// Create compound index for user and employeeId to ensure uniqueness per user
employeeSchema.index({ user: 1, employeeId: 1 }, { unique: true });

// Create index for user and createdAt for efficient querying
employeeSchema.index({ user: 1, createdAt: -1 });

// Create index for user and status for filtering
employeeSchema.index({ user: 1, status: 1 });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee; 