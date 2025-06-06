import { employees as employeesApi, customerPayments as customerPaymentsApi, expenses as expensesApi } from '../services/api';
import toast from 'react-hot-toast';

interface MigrationResult {
  success: boolean;
  migrated: {
    expenses: number;
    employees: number;
    customerPayments: number;
  };
  errors: string[];
}

/**
 * Migrate localStorage data to MongoDB via API calls
 * This function will be called once for users who have existing localStorage data
 */
export const migrateLocalStorageToAPI = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    migrated: {
      expenses: 0,
      employees: 0,
      customerPayments: 0
    },
    errors: []
  };

  try {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated. Please log in first.');
    }

    toast.loading('Starting data migration...');

    // 1. Migrate Expenses
    try {
      const localExpenses = localStorage.getItem('expenses');
      if (localExpenses) {
        const expenses = JSON.parse(localExpenses);
        if (Array.isArray(expenses) && expenses.length > 0) {
          console.log(`Found ${expenses.length} expenses to migrate`);
          
          for (const expense of expenses) {
            try {
              // Transform expense data to match new schema
              const expenseData = {
                projectId: expense.projectId || expense.project || 'default',
                amount: parseFloat(expense.amount) || 0,
                date: expense.date || new Date().toISOString().split('T')[0],
                category: expense.category || 'office',
                subcategory: expense.subcategory || 'misc',
                description: expense.description || 'Migrated expense',
                paymentMode: expense.paymentMode || 'cash',
                chequeNumber: expense.chequeNumber || '',
                transactionId: expense.transactionId || '',
                employeeId: expense.employeeId || '',
                salaryMonth: expense.salaryMonth || '',
                overrideSalary: parseFloat(expense.overrideSalary) || 0,
                landlordId: expense.landlordId || '',
                landPurchaseAmount: parseFloat(expense.landPurchaseAmount) || 0,
                landDetails: expense.landDetails || ''
              };

              await expensesApi.create(expenseData);
              result.migrated.expenses++;
            } catch (error: any) {
              console.error('Error migrating expense:', error);
              result.errors.push(`Expense migration error: ${error.message}`);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error migrating expenses:', error);
      result.errors.push(`Expenses migration failed: ${error.message}`);
    }

    // 2. Migrate Employees
    try {
      const localEmployees = localStorage.getItem('employees');
      if (localEmployees) {
        const employees = JSON.parse(localEmployees);
        if (Array.isArray(employees) && employees.length > 0) {
          console.log(`Found ${employees.length} employees to migrate`);
          
          for (const employee of employees) {
            try {
              // Transform employee data to match new schema
              const employeeData = {
                employeeId: employee.employeeId || employee.id || `EMP-${Date.now()}`,
                name: employee.name || 'Unknown Employee',
                jobTitle: employee.jobTitle || 'Employee',
                salary: parseFloat(employee.salary) || 0,
                phone: employee.phone || '',
                email: employee.email || '',
                address: employee.address || '',
                joiningDate: employee.joiningDate || new Date().toISOString().split('T')[0],
                status: employee.status || 'active'
              };

              await employeesApi.create(employeeData);
              result.migrated.employees++;
            } catch (error: any) {
              console.error('Error migrating employee:', error);
              result.errors.push(`Employee migration error: ${error.message}`);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error migrating employees:', error);
      result.errors.push(`Employees migration failed: ${error.message}`);
    }

    // 3. Migrate Customer Payments
    try {
      const localCustomerPayments = localStorage.getItem('customerPayments');
      if (localCustomerPayments) {
        const customerPayments = JSON.parse(localCustomerPayments);
        if (Array.isArray(customerPayments) && customerPayments.length > 0) {
          console.log(`Found ${customerPayments.length} customer payments to migrate`);
          
          for (const payment of customerPayments) {
            try {
              // Transform customer payment data to match new schema
              const paymentData = {
                amount: parseFloat(payment.amount) || 0,
                date: payment.date || new Date().toISOString().split('T')[0],
                description: payment.description || 'Migrated payment',
                paymentMode: payment.paymentMode || 'cash',
                chequeNumber: payment.chequeNumber || '',
                transactionId: payment.transactionId || '',
                customerName: payment.customerName || 'Unknown Customer',
                invoiceNumber: payment.invoiceNumber || '',
                projectId: payment.projectId || 'default',
                plotNumber: payment.plotNumber || '',
                paymentCategory: payment.paymentCategory || 'token',
                totalPrice: parseFloat(payment.totalPrice) || parseFloat(payment.amount) || 0,
                developmentCharges: parseFloat(payment.developmentCharges) || 0,
                clubhouseCharges: parseFloat(payment.clubhouseCharges) || 0,
                constructionCharges: parseFloat(payment.constructionCharges) || 0
              };

              await customerPaymentsApi.create(paymentData);
              result.migrated.customerPayments++;
            } catch (error: any) {
              console.error('Error migrating customer payment:', error);
              result.errors.push(`Customer payment migration error: ${error.message}`);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error migrating customer payments:', error);
      result.errors.push(`Customer payments migration failed: ${error.message}`);
    }

    toast.dismiss();

    if (result.errors.length > 0) {
      result.success = false;
      toast.error(`Migration completed with ${result.errors.length} errors. Check console for details.`);
    } else {
      toast.success('Data migration completed successfully!');
    }

    return result;

  } catch (error: any) {
    toast.dismiss();
    console.error('Migration failed:', error);
    result.success = false;
    result.errors.push(`Migration failed: ${error.message}`);
    toast.error('Migration failed. Please try again.');
    return result;
  }
};

/**
 * Check if user has localStorage data that needs migration
 */
export const hasLocalStorageData = (): boolean => {
  try {
    const hasExpenses = localStorage.getItem('expenses') !== null;
    const hasEmployees = localStorage.getItem('employees') !== null;
    const hasCustomerPayments = localStorage.getItem('customerPayments') !== null;
    
    return hasExpenses || hasEmployees || hasCustomerPayments;
  } catch (error) {
    console.error('Error checking localStorage data:', error);
    return false;
  }
};

/**
 * Get count of localStorage data items
 */
export const getLocalStorageDataCount = (): { expenses: number; employees: number; customerPayments: number } => {
  const count = { expenses: 0, employees: 0, customerPayments: 0 };
  
  try {
    const expenses = localStorage.getItem('expenses');
    if (expenses) {
      const expensesArray = JSON.parse(expenses);
      if (Array.isArray(expensesArray)) {
        count.expenses = expensesArray.length;
      }
    }

    const employees = localStorage.getItem('employees');
    if (employees) {
      const employeesArray = JSON.parse(employees);
      if (Array.isArray(employeesArray)) {
        count.employees = employeesArray.length;
      }
    }

    const customerPayments = localStorage.getItem('customerPayments');
    if (customerPayments) {
      const paymentsArray = JSON.parse(customerPayments);
      if (Array.isArray(paymentsArray)) {
        count.customerPayments = paymentsArray.length;
      }
    }
  } catch (error) {
    console.error('Error counting localStorage data:', error);
  }

  return count;
};

/**
 * Clear localStorage data after successful migration
 * Should only be called after confirming successful migration
 */
export const clearMigratedLocalStorageData = (): void => {
  try {
    // Keep authentication token and user preferences
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Clear data-related localStorage items
    localStorage.removeItem('expenses');
    localStorage.removeItem('employees');
    localStorage.removeItem('customerPayments');
    
    // Note: We keep customers, projects, categories, etc. as they might be used as fallback data
    
    console.log('Migrated localStorage data cleared successfully');
    toast.success('Local data cleared after successful migration');
  } catch (error) {
    console.error('Error clearing localStorage data:', error);
    toast.error('Failed to clear local data');
  }
};

/**
 * Display migration prompt to user
 */
export const shouldShowMigrationPrompt = (): boolean => {
  const hasData = hasLocalStorageData();
  const migrationCompleted = localStorage.getItem('migration_completed') === 'true';
  
  return hasData && !migrationCompleted;
};

/**
 * Mark migration as completed
 */
export const markMigrationCompleted = (): void => {
  localStorage.setItem('migration_completed', 'true');
}; 