const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const authenticateToken = require('../middleware/auth');

// Get all projects for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    
    // Transform the data to match frontend expectations
    const transformedProjects = projects.map(project => ({
      id: project._id.toString(),
      name: project.name,
      color: project.color,
      location: project.location,
      commenceDate: project.commenceDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      createdAt: project.createdAt.toISOString()
    }));

    res.json(transformedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Get project by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const transformedProject = {
      id: project._id.toString(),
      name: project.name,
      color: project.color,
      location: project.location,
      commenceDate: project.commenceDate.toISOString().split('T')[0],
      createdAt: project.createdAt.toISOString()
    };

    res.json(transformedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, color, location, commenceDate } = req.body;

    // Validate required fields
    if (!name || !color || !location || !commenceDate) {
      return res.status(400).json({ 
        message: 'All fields are required: name, color, location, commenceDate' 
      });
    }

    // Check if project name already exists for this user
    const existingProject = await Project.findOne({
      name: name.trim(),
      user: req.user.userId
    });

    if (existingProject) {
      return res.status(400).json({ 
        message: 'A project with this name already exists' 
      });
    }

    const project = new Project({
      name: name.trim(),
      color,
      location: location.trim(),
      commenceDate: new Date(commenceDate),
      user: req.user.userId
    });

    const savedProject = await project.save();
    
    const transformedProject = {
      id: savedProject._id.toString(),
      name: savedProject.name,
      color: savedProject.color,
      location: savedProject.location,
      commenceDate: savedProject.commenceDate.toISOString().split('T')[0],
      createdAt: savedProject.createdAt.toISOString()
    };

    res.status(201).json({ 
      message: 'Project created successfully', 
      project: transformedProject 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: 'Error creating project' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, color, location, commenceDate } = req.body;

    // Validate required fields
    if (!name || !color || !location || !commenceDate) {
      return res.status(400).json({ 
        message: 'All fields are required: name, color, location, commenceDate' 
      });
    }

    // Check if project exists and belongs to user
    const project = await Project.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if name conflicts with another project (excluding current one)
    const existingProject = await Project.findOne({
      name: name.trim(),
      user: req.user.userId,
      _id: { $ne: req.params.id }
    });

    if (existingProject) {
      return res.status(400).json({ 
        message: 'A project with this name already exists' 
      });
    }

    // Update project
    project.name = name.trim();
    project.color = color;
    project.location = location.trim();
    project.commenceDate = new Date(commenceDate);

    const updatedProject = await project.save();

    const transformedProject = {
      id: updatedProject._id.toString(),
      name: updatedProject.name,
      color: updatedProject.color,
      location: updatedProject.location,
      commenceDate: updatedProject.commenceDate.toISOString().split('T')[0],
      createdAt: updatedProject.createdAt.toISOString()
    };

    res.json({ 
      message: 'Project updated successfully', 
      project: transformedProject 
    });
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: 'Error updating project' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Here you might want to check if there are any expenses/customers associated with this project
    // before allowing deletion. For now, we'll proceed with deletion.

    await Project.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

// Get project statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments({ user: req.user.userId });
    
    // Get projects started this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const projectsThisMonth = await Project.countDocuments({
      user: req.user.userId,
      commenceDate: { $gte: startOfMonth }
    });

    res.json({
      totalProjects,
      projectsThisMonth,
      activeProjects: totalProjects // For now, all projects are considered active
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ message: 'Error fetching project statistics' });
  }
});

module.exports = router; 