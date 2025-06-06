const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

// GET /api/audit-logs - Get audit logs with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      entityType,
      action,
      startDate,
      endDate,
      entityId,
      search
    } = req.query;

    // Build query
    const userId = req.user.userId || req.user.id;
    const query = { user: userId };

    if (entityType && entityType !== 'all') {
      query.entityType = entityType;
    }

    if (action && action !== 'all') {
      query.action = action;
    }

    if (entityId) {
      query.entityId = entityId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Search in description
    if (search) {
      query['metadata.description'] = { $regex: search, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const auditLogs = await AuditLog.find(query)
      .populate('user', 'username email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await AuditLog.countDocuments(query);


    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    res.json({
      auditLogs,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        hasNext,
        hasPrev,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/audit-logs/stats - Get audit log statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build base query
    const query = { user: req.user.userId || req.user.id };

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Get statistics using aggregation
    const stats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          actionStats: {
            $push: {
              action: '$action',
              entityType: '$entityType'
            }
          }
        }
      }
    ]);

    // Get action breakdown
    const actionBreakdown = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get entity type breakdown
    const entityBreakdown = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$entityType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get daily activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivity = await AuditLog.aggregate([
      { 
        $match: { 
          ...query,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      total: stats[0]?.totalLogs || 0,
      actionBreakdown: actionBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      entityBreakdown: entityBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      dailyActivity: dailyActivity.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/audit-logs/:id - Get specific audit log
router.get('/:id', auth, async (req, res) => {
  try {
    const auditLog = await AuditLog.findOne({
      _id: req.params.id,
      user: req.user.userId || req.user.id
    }).populate('user', 'username email');

    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    res.json(auditLog);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 