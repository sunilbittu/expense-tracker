import { AuditLog, AuditLogFilterOptions, AuditLogStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AuditLogResponse {
  auditLogs: AuditLog[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalRecords: number;
  };
}

class AuditLogService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getAuditLogs(
    filters: Partial<AuditLogFilterOptions> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<AuditLogResponse> {
    const searchParams = new URLSearchParams();
    
    // Add pagination parameters
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    
    // Add filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        searchParams.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE_URL}/audit-logs?${searchParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }

    return await response.json();
  }

  async getAuditLogStats(
    startDate?: string,
    endDate?: string
  ): Promise<AuditLogStats> {
    const searchParams = new URLSearchParams();
    
    if (startDate) {
      searchParams.append('startDate', startDate);
    }
    
    if (endDate) {
      searchParams.append('endDate', endDate);
    }

    const response = await fetch(`${API_BASE_URL}/audit-logs/stats?${searchParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit log stats');
    }

    return await response.json();
  }

  async getAuditLogById(id: string): Promise<AuditLog> {
    const response = await fetch(`${API_BASE_URL}/audit-logs/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit log');
    }

    return await response.json();
  }

  // Helper method to format entity type for display
  formatEntityType(entityType: string): string {
    const entityTypeMap: Record<string, string> = {
      'expense': 'Expense',
      'income': 'Income',
      'customer-payment': 'Customer Payment',
      'customer': 'Customer',
      'employee': 'Employee',
      'landlord': 'Landlord',
      'project': 'Project',
      'category': 'Category'
    };
    
    return entityTypeMap[entityType] || entityType;
  }

  // Helper method to format action for display
  formatAction(action: string): string {
    const actionMap: Record<string, string> = {
      'CREATE': 'Created',
      'UPDATE': 'Updated',
      'DELETE': 'Deleted'
    };
    
    return actionMap[action] || action;
  }

  // Helper method to get action color
  getActionColor(action: string): string {
    const colorMap: Record<string, string> = {
      'CREATE': 'text-green-600',
      'UPDATE': 'text-blue-600',
      'DELETE': 'text-red-600'
    };
    
    return colorMap[action] || 'text-gray-600';
  }

  // Helper method to get action badge color
  getActionBadgeColor(action: string): string {
    const colorMap: Record<string, string> = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800'
    };
    
    return colorMap[action] || 'bg-gray-100 text-gray-800';
  }
}

export const auditLogService = new AuditLogService(); 