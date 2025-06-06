const AuditLog = require('../models/AuditLog');

// Utility function to get entity name from model
const getEntityTypeFromModel = (modelName) => {
  const modelToEntityMap = {
    'Expense': 'expense',
    'Income': 'income',
    'CustomerPayment': 'customer-payment',
    'Customer': 'customer',
    'Employee': 'employee',
    'Landlord': 'landlord',  
    'Project': 'project',
    'Category': 'category'
  };
  return modelToEntityMap[modelName] || modelName.toLowerCase();
};

// Middleware to log create operations
const logCreate = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Only log successful create operations (status 201)
    if (res.statusCode === 201 && req.user) {
      try {
        const responseData = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Extract entity info from the response or request
        const entityType = req.auditEntityType || getEntityTypeFromModel(req.route?.path);
        
        // Try to extract entity ID from various response structures
        let entityId = responseData._id || responseData.id;
        let entityData = responseData;
        
        // Check if data is nested (e.g., { expense: { _id: ... } })
        if (!entityId && responseData.expense) {
          entityId = responseData.expense._id || responseData.expense.id;
          entityData = responseData.expense;
        }
        if (!entityId && responseData.income) {
          entityId = responseData.income._id || responseData.income.id;
          entityData = responseData.income;
        }
        if (!entityId && responseData.customer) {
          entityId = responseData.customer._id || responseData.customer.id;
          entityData = responseData.customer;
        }
        if (!entityId && responseData.employee) {
          entityId = responseData.employee._id || responseData.employee.id;
          entityData = responseData.employee;
        }
        if (!entityId && responseData.landlord) {
          entityId = responseData.landlord._id || responseData.landlord.id;
          entityData = responseData.landlord;
        }
        if (!entityId && responseData.project) {
          entityId = responseData.project._id || responseData.project.id;
          entityData = responseData.project;
        }
        
        if (entityType && entityId) {
          const auditLog = new AuditLog({
            user: req.user.userId || req.user.id,
            action: 'CREATE',
            entityType,
            entityId: entityId.toString(),
            changes: {
              old: null,
              new: entityData
            },
            metadata: {
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip,
              description: `Created ${entityType} with ID ${entityId}`
            }
          });
          
          auditLog.save()
            .then(() => console.log(`✅ Audit log saved successfully: ${entityType} ${entityId}`))
            .catch(err => console.error('❌ Audit log error:', err));
        } else {
          console.log(`⚠️ Skipping audit log - missing data: entityType=${entityType}, entityId=${entityId}, status=${res.statusCode}`);
        }
      } catch (error) {
        console.error('Error logging create operation:', error);
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware to log update operations
const logUpdate = (entityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    // Store original data before update
    req.originalData = null;
    if (req.params.id && req.user) {
      try {
        // Get the appropriate model based on entity type
        const models = {
          'expense': require('../models/Expense'),
          'income': require('../models/Income'),
          'customer-payment': require('../models/CustomerPayment'),
          'customer': require('../models/Customer'),
          'employee': require('../models/Employee'),
          'landlord': require('../models/Landlord'),
          'project': require('../models/Project'),
          'category': require('../models/Category')
        };
        
        const Model = models[entityType];
        if (Model) {
          const originalDoc = await Model.findOne({
            _id: req.params.id,
            user: req.user.userId || req.user.id
          });
          req.originalData = originalDoc ? originalDoc.toObject() : null;
        }
      } catch (error) {
        console.error('Error fetching original data:', error);
      }
    }
    
    res.send = function(data) {
      // Only log successful update operations (status 200)
      if (res.statusCode === 200 && req.user && req.params.id) {
        try {
          const responseData = typeof data === 'string' ? JSON.parse(data) : data;
          
          // Extract updated entity data from response
          let entityData = responseData;
          if (responseData.expense) entityData = responseData.expense;
          else if (responseData.income) entityData = responseData.income;
          else if (responseData.customer) entityData = responseData.customer;
          else if (responseData.employee) entityData = responseData.employee;
          else if (responseData.landlord) entityData = responseData.landlord;
          else if (responseData.project) entityData = responseData.project;
          
          const auditLog = new AuditLog({
            user: req.user.userId || req.user.id,
            action: 'UPDATE',
            entityType,
            entityId: req.params.id,
            changes: {
              old: req.originalData,
              new: entityData
            },
            metadata: {
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip,
              description: `Updated ${entityType} with ID ${req.params.id}`
            }
          });
          
          auditLog.save().catch(err => console.error('Audit log error:', err));
        } catch (error) {
          console.error('Error logging update operation:', error);
        }
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware to log delete operations
const logDelete = (entityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    // Store original data before deletion
    req.originalData = null;
    if (req.params.id && req.user) {
      try {
        // Get the appropriate model based on entity type
        const models = {
          'expense': require('../models/Expense'),
          'income': require('../models/Income'),
          'customer-payment': require('../models/CustomerPayment'),
          'customer': require('../models/Customer'),
          'employee': require('../models/Employee'),
          'landlord': require('../models/Landlord'),
          'project': require('../models/Project'),
          'category': require('../models/Category')
        };
        
        const Model = models[entityType];
        if (Model) {
          const originalDoc = await Model.findOne({
            _id: req.params.id,
            user: req.user.userId || req.user.id
          });
          req.originalData = originalDoc ? originalDoc.toObject() : null;
        }
      } catch (error) {
        console.error('Error fetching data before deletion:', error);
      }
    }
    
    res.send = function(data) {
      // Only log successful delete operations (status 200)
      if (res.statusCode === 200 && req.user && req.params.id) {
        try {
          const auditLog = new AuditLog({
            user: req.user.userId || req.user.id,
            action: 'DELETE',
            entityType,
            entityId: req.params.id,
            changes: {
              old: req.originalData,
              new: null
            },
            metadata: {
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip,
              description: `Deleted ${entityType} with ID ${req.params.id}`
            }
          });
          
          auditLog.save().catch(err => console.error('Audit log error:', err));
        } catch (error) {
          console.error('Error logging delete operation:', error);
        }
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Generic audit logger that can be used with any entity type
const auditLogger = (entityType, action) => {
  switch (action) {
    case 'CREATE':
      return logCreate;
    case 'UPDATE':
      return logUpdate(entityType);
    case 'DELETE':
      return logDelete(entityType);
    default:
      return (req, res, next) => next();
  }
};

module.exports = {
  logCreate,
  logUpdate,
  logDelete,
  auditLogger
}; 