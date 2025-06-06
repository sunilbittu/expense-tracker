const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['expense', 'income', 'customer-payment', 'customer', 'employee', 'landlord', 'project', 'category'],
    required: true
  },
  entityId: {
    type: String,
    required: true
  },
  changes: {
    old: mongoose.Schema.Types.Mixed,
    new: mongoose.Schema.Types.Mixed
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    description: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ user: 1, entityType: 1, timestamp: -1 });
auditLogSchema.index({ user: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ user: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog; 