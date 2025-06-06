# Audit Log System Implementation Guide

## Overview
A comprehensive audit log system has been implemented for the expense tracker application to track all changes and activities in the system.

## Backend Implementation

### 1. Database Model
- **File**: `backend/models/AuditLog.js`
- **Purpose**: Stores all audit log entries
- **Fields**:
  - `user`: Reference to the user who performed the action
  - `action`: CREATE, UPDATE, or DELETE
  - `entityType`: Type of entity affected (expense, income, customer, etc.)
  - `entityId`: ID of the affected entity
  - `changes`: Object containing old and new data
  - `metadata`: Additional information (IP address, user agent, description)
  - `timestamp`: When the action occurred

### 2. Audit Middleware
- **File**: `backend/middleware/auditLogger.js`
- **Purpose**: Automatically logs CRUD operations
- **Functions**:
  - `logCreate`: Logs creation operations
  - `logUpdate`: Logs update operations (fetches original data before update)
  - `logDelete`: Logs deletion operations (fetches original data before deletion)
  - `auditLogger`: Generic function to apply appropriate logging

### 3. API Routes
- **File**: `backend/routes/auditLogs.js`
- **Endpoints**:
  - `GET /api/audit-logs`: Get audit logs with filtering and pagination
  - `GET /api/audit-logs/stats`: Get audit log statistics
  - `GET /api/audit-logs/:id`: Get specific audit log details

### 4. Integration Example
The audit middleware has been integrated into the expenses routes:

```javascript
// In backend/routes/expenses.js
const { auditLogger } = require('../middleware/auditLogger');

// Create expense with audit logging
router.post('/', authenticateToken, auditLogger('expense', 'CREATE'), async (req, res) => {
  req.auditEntityType = 'expense';
  // ... expense creation logic
});

// Update expense with audit logging
router.put('/:id', authenticateToken, auditLogger('expense', 'UPDATE'), async (req, res) => {
  // ... expense update logic
});

// Delete expense with audit logging
router.delete('/:id', authenticateToken, auditLogger('expense', 'DELETE'), async (req, res) => {
  // ... expense deletion logic
});
```

## Frontend Implementation

### 1. Types
- **File**: `src/types/index.ts`
- **Added Types**:
  - `AuditLog`: Main audit log entry type
  - `AuditLogAction`: CREATE, UPDATE, DELETE actions
  - `AuditLogEntityType`: All supported entity types
  - `AuditLogFilterOptions`: Filter options for audit log queries
  - `AuditLogStats`: Statistics data structure

### 2. Service Layer
- **File**: `src/services/auditLogService.ts`
- **Functions**:
  - `getAuditLogs()`: Fetch audit logs with filtering and pagination
  - `getAuditLogStats()`: Fetch audit log statistics
  - `getAuditLogById()`: Fetch specific audit log
  - Helper functions for formatting and styling

### 3. Audit Log Screen
- **File**: `src/components/AuditLogList.tsx`
- **Features**:
  - **Table View**: Displays audit logs in a paginated table
  - **Advanced Filters**: 
    - Search by description
    - Filter by entity type
    - Filter by action (CREATE/UPDATE/DELETE)
    - Date range filtering
    - Entity ID filtering
  - **Statistics Panel**: Shows activity breakdown by action and entity type
  - **Detail Modal**: Shows complete audit log details including before/after changes
  - **Pagination**: Full pagination support with page navigation
  - **Responsive Design**: Works on mobile and desktop

### 4. Navigation Integration
- Added "Audit Logs" to the sidebar navigation
- Updated `ActiveView` type to include 'audit-logs'
- Integrated into the main layout component

## Features

### Filtering Capabilities
- **Entity Type**: Filter by specific entity types (expense, income, customer, etc.)
- **Action**: Filter by operation type (CREATE, UPDATE, DELETE)
- **Date Range**: Filter by date range
- **Search**: Search in audit log descriptions
- **Entity ID**: Filter by specific entity ID

### Statistics Dashboard
- **Total Logs**: Count of all audit logs
- **Action Breakdown**: Count by action type (CREATE/UPDATE/DELETE)
- **Entity Breakdown**: Count by entity type
- **Daily Activity**: Activity trends over the last 30 days

### Detailed View
- **Complete Metadata**: User, timestamp, IP address, user agent
- **Change Tracking**: Before and after data comparison
- **JSON Diff View**: Side-by-side comparison of old vs new data

## Security Features
- **User Isolation**: Each user only sees their own audit logs
- **Authentication Required**: All audit log endpoints require authentication
- **IP Tracking**: Records IP address for each action
- **User Agent Tracking**: Records browser/client information

## Usage Instructions

### For Developers
1. **Adding Audit Logging to New Routes**:
   ```javascript
   const { auditLogger } = require('../middleware/auditLogger');
   
   router.post('/', auth, auditLogger('entityType', 'CREATE'), handler);
   router.put('/:id', auth, auditLogger('entityType', 'UPDATE'), handler);
   router.delete('/:id', auth, auditLogger('entityType', 'DELETE'), handler);
   ```

2. **Setting Entity Type for Create Operations**:
   ```javascript
   router.post('/', auth, auditLogger('expense', 'CREATE'), async (req, res) => {
     req.auditEntityType = 'expense'; // Set this for proper logging
     // ... rest of the handler
   });
   ```

### For Users
1. **Accessing Audit Logs**: Click "Audit Logs" in the sidebar
2. **Filtering**: Use the filter panel to narrow down results
3. **Viewing Details**: Click "View" on any audit log entry
4. **Statistics**: Click "Show Stats" to see activity breakdown

## Benefits
- **Complete Traceability**: Track all changes to critical data
- **Compliance**: Meet audit requirements for financial data
- **Debugging**: Understand what changes were made and when
- **Security**: Monitor for suspicious activity
- **User Accountability**: Track who made what changes

## Future Enhancements
- **Restore Functionality**: Ability to restore deleted records from audit logs
- **Advanced Analytics**: Trend analysis and reporting
- **Email Notifications**: Alert on specific audit events
- **Export Functionality**: Export audit logs to CSV/PDF
- **Real-time Updates**: Live updates of audit log activity 