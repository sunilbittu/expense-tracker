const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true,
    maxlength: [100, 'Subcategory name cannot exceed 100 characters']
  },
  icon: {
    type: String,
    required: [true, 'Subcategory icon is required'],
    trim: true
  }
}, { _id: false });

const categorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  icon: {
    type: String,
    required: [true, 'Category icon is required'],
    trim: true
  },
  subcategories: [subCategorySchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
categorySchema.index({ user: 1, id: 1 });
categorySchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Category', categorySchema); 