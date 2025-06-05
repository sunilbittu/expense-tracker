const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const authenticateToken = require('../middleware/auth');

// Get all categories for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    
    // Transform the data to match frontend expectations
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      subcategories: category.subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        icon: sub.icon
      })),
      createdAt: category.createdAt.toISOString()
    }));

    res.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get category by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await Category.findOne({ 
      id: req.params.id, 
      user: req.user.userId 
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const transformedCategory = {
      id: category.id,
      name: category.name,
      icon: category.icon,
      subcategories: category.subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        icon: sub.icon
      })),
      createdAt: category.createdAt.toISOString()
    };

    res.json(transformedCategory);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
});

// Create new category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id, name, icon, subcategories } = req.body;

    // Validate required fields
    if (!id || !name || !icon || !subcategories || !Array.isArray(subcategories)) {
      return res.status(400).json({ 
        message: 'All fields are required: id, name, icon, subcategories (array)' 
      });
    }

    // Check if category ID already exists for this user
    const existingCategory = await Category.findOne({
      id: id.trim(),
      user: req.user.userId
    });

    if (existingCategory) {
      return res.status(400).json({ 
        message: 'A category with this ID already exists' 
      });
    }

    // Validate subcategories
    for (const sub of subcategories) {
      if (!sub.id || !sub.name || !sub.icon) {
        return res.status(400).json({
          message: 'Each subcategory must have id, name, and icon'
        });
      }
    }

    const category = new Category({
      id: id.trim(),
      name: name.trim(),
      icon: icon.trim(),
      subcategories: subcategories.map(sub => ({
        id: sub.id.trim(),
        name: sub.name.trim(),
        icon: sub.icon.trim()
      })),
      user: req.user.userId
    });

    const savedCategory = await category.save();
    
    const transformedCategory = {
      id: savedCategory.id,
      name: savedCategory.name,
      icon: savedCategory.icon,
      subcategories: savedCategory.subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        icon: sub.icon
      })),
      createdAt: savedCategory.createdAt.toISOString()
    };

    res.status(201).json({ 
      message: 'Category created successfully', 
      category: transformedCategory 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, icon, subcategories } = req.body;

    // Validate required fields
    if (!name || !icon || !subcategories || !Array.isArray(subcategories)) {
      return res.status(400).json({ 
        message: 'All fields are required: name, icon, subcategories (array)' 
      });
    }

    // Check if category exists and belongs to user
    const category = await Category.findOne({ 
      id: req.params.id, 
      user: req.user.userId 
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Validate subcategories
    for (const sub of subcategories) {
      if (!sub.id || !sub.name || !sub.icon) {
        return res.status(400).json({
          message: 'Each subcategory must have id, name, and icon'
        });
      }
    }

    // Update category
    category.name = name.trim();
    category.icon = icon.trim();
    category.subcategories = subcategories.map(sub => ({
      id: sub.id.trim(),
      name: sub.name.trim(),
      icon: sub.icon.trim()
    }));

    const updatedCategory = await category.save();

    const transformedCategory = {
      id: updatedCategory.id,
      name: updatedCategory.name,
      icon: updatedCategory.icon,
      subcategories: updatedCategory.subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        icon: sub.icon
      })),
      createdAt: updatedCategory.createdAt.toISOString()
    };

    res.json({ 
      message: 'Category updated successfully', 
      category: transformedCategory 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await Category.findOne({ 
      id: req.params.id, 
      user: req.user.userId 
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Here you might want to check if there are any expenses associated with this category
    // before allowing deletion. For now, we'll proceed with deletion.

    await Category.findOneAndDelete({ id: req.params.id, user: req.user.userId });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Initialize default categories for a user
router.post('/init-defaults', authenticateToken, async (req, res) => {
  try {
    // Check if user already has categories
    const existingCategories = await Category.find({ user: req.user.userId });
    
    if (existingCategories.length > 0) {
      return res.status(400).json({ 
        message: 'User already has categories initialized' 
      });
    }

    // Default categories data (from your mockData)
    const defaultCategories = [
      {
        id: 'office',
        name: 'Office Expenses',
        icon: 'Building2',
        subcategories: [
          { id: 'rent', name: 'Rent', icon: 'Home' },
          { id: 'utilities', name: 'Electricity & Utilities', icon: 'Wifi' },
          { id: 'supplies', name: 'Office Supplies', icon: 'ShoppingCart' },
          { id: 'furniture', name: 'Furniture & Equipment', icon: 'Briefcase' },
          { id: 'salaries', name: 'Salaries & Wages', icon: 'Briefcase' },
          { id: 'maintenance', name: 'Maintenance & Repairs', icon: 'Construction' },
          { id: 'cleaning', name: 'Cleaning Services', icon: 'Home' },
          { id: 'telecom', name: 'Telephone & Internet', icon: 'Smartphone' },
          { id: 'software', name: 'Software & Subscriptions', icon: 'Wifi' },
          { id: 'travel', name: 'Travel & Conveyance', icon: 'Plane' },
          { id: 'courier', name: 'Courier & Postage', icon: 'Car' },
          { id: 'refreshments', name: 'Refreshments', icon: 'Pizza' },
          { id: 'marketing', name: 'Marketing & Advertising', icon: 'Briefcase' },
          { id: 'consultant', name: 'Consultant Fees', icon: 'Briefcase' },
          { id: 'misc', name: 'Miscellaneous', icon: 'ShoppingCart' }
        ]
      },
      {
        id: 'construction',
        name: 'Site & Construction',
        icon: 'Construction',
        subcategories: [
          { id: 'land', name: 'Land Purchase', icon: 'Home' },
          { id: 'site-prep', name: 'Site Clearance & Preparation', icon: 'Construction' },
          { id: 'architect', name: 'Architect & Design Fees', icon: 'Briefcase' },
          { id: 'permissions', name: 'Permissions & Approvals', icon: 'Briefcase' },
          { id: 'materials', name: 'Material Purchase', icon: 'ShoppingCart' },
          { id: 'labor', name: 'Labor Charges', icon: 'Briefcase' },
          { id: 'machinery', name: 'Site Machinery Rental', icon: 'Construction' },
          { id: 'transport', name: 'Transportation', icon: 'Car' },
          { id: 'foundation', name: 'Foundation Work', icon: 'Construction' },
          { id: 'superstructure', name: 'Superstructure Costs', icon: 'Construction' },
          { id: 'roofing', name: 'Roofing & Waterproofing', icon: 'Home' },
          { id: 'plumbing', name: 'Plumbing & Sanitary', icon: 'Construction' },
          { id: 'electrical', name: 'Electrical Work', icon: 'Wifi' },
          { id: 'interior', name: 'Interior Finishing', icon: 'Home' },
          { id: 'painting', name: 'Painting & Polishing', icon: 'Construction' },
          { id: 'boundary', name: 'Boundary Wall & Gate', icon: 'Construction' },
          { id: 'supervision', name: 'Site Supervision & Staff', icon: 'Briefcase' },
          { id: 'amenities', name: 'Amenities Construction', icon: 'Construction' },
          { id: 'contingency', name: 'Contingency', icon: 'ShoppingCart' }
        ]
      }
    ];

    // Create categories for the user
    const createdCategories = await Category.insertMany(
      defaultCategories.map(cat => ({
        ...cat,
        user: req.user.userId
      }))
    );

    const transformedCategories = createdCategories.map(category => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      subcategories: category.subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        icon: sub.icon
      })),
      createdAt: category.createdAt.toISOString()
    }));

    res.status(201).json({ 
      message: 'Default categories initialized successfully',
      categories: transformedCategories
    });
  } catch (error) {
    console.error('Error initializing default categories:', error);
    res.status(500).json({ message: 'Error initializing default categories' });
  }
});

// Get category statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments({ user: req.user.userId });
    
    // Count total subcategories
    const categories = await Category.find({ user: req.user.userId });
    const totalSubcategories = categories.reduce((total, cat) => total + cat.subcategories.length, 0);

    res.json({
      totalCategories,
      totalSubcategories,
      activeCategories: totalCategories // For now, all categories are considered active
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ message: 'Error fetching category statistics' });
  }
});

module.exports = router; 