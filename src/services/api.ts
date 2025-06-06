import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-uhoh.onrender.com/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const auth = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return { valid: true };
    } catch (error) {
      return { valid: false };
    }
  },
};

// Expenses API
export const expenses = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    category?: string;
    subcategory?: string;
    projectId?: string;
    paymentMode?: string;
    employeeId?: string;
    landlordId?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/expenses?${queryParams.toString()}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  create: async (expenseData: any) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },
  update: async (id: string, expenseData: any) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/expenses/stats/summary?${queryParams.toString()}`);
    return response.data;
  },
};

// Customers API
export const customers = {
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  create: async (customerData: any) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  update: async (id: string, customerData: any) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/customers/stats/summary');
    return response.data;
  },
};

// Projects API
export const projects = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  create: async (projectData: any) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  update: async (id: string, projectData: any) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/projects/stats/summary');
    return response.data;
  },
};

// Incomes API
export const incomes = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    paymentMode?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/incomes?${queryParams.toString()}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/incomes/${id}`);
    return { income: response.data };
  },
  create: async (incomeData: any) => {
    const response = await api.post('/incomes', incomeData);
    return response.data;
  },
  update: async (id: string, incomeData: any) => {
    const response = await api.put(`/incomes/${id}`, incomeData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/incomes/${id}`);
    return response.data;
  },
  getUniqueSources: async () => {
    const response = await api.get('/incomes/sources/unique');
    return response.data;
  },
  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/incomes/stats/summary?${queryParams.toString()}`);
    return response.data;
  },
};

// Categories API
export const categories = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (categoryData: any) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  update: async (id: string, categoryData: any) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
  initDefaults: async () => {
    const response = await api.post('/categories/init-defaults');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/categories/stats/summary');
    return response.data;
  },
};

// Landlords API
export const landlords = {
  getAll: async () => {
    const response = await api.get('/landlords');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/landlords/${id}`);
    return response.data;
  },
  create: async (landlordData: any) => {
    const response = await api.post('/landlords', landlordData);
    return response.data;
  },
  update: async (id: string, landlordData: any) => {
    const response = await api.put(`/landlords/${id}`, landlordData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/landlords/${id}`);
    return response.data;
  }
};

// Employees API
export const employees = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
    jobTitle?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/employees?${queryParams.toString()}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  create: async (employeeData: any) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },
  update: async (id: string, employeeData: any) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/employees/stats/summary');
    return response.data;
  },
};

// Customer Payments API
export const customerPayments = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    paymentMode?: string;
    paymentCategory?: string;
    projectId?: string;
    customerName?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/customer-payments?${queryParams.toString()}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/customer-payments/${id}`);
    return response.data;
  },
  create: async (paymentData: any) => {
    const response = await api.post('/customer-payments', paymentData);
    return response.data;
  },
  update: async (id: string, paymentData: any) => {
    const response = await api.put(`/customer-payments/${id}`, paymentData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/customer-payments/${id}`);
    return response.data;
  },
  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/customer-payments/stats/summary?${queryParams.toString()}`);
    return response.data;
  },
};

export default {
  auth,
  expenses,
  incomes,
  customers,
  projects,
  categories,
  landlords,
  employees,
  customerPayments,
};
