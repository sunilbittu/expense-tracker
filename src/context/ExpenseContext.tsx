import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, Project, Category, Income, CustomerPayment, Customer, ExpenseContextType, Employee, Landlord } from '../types';
import { customers as customersApi, projects as projectsApi, categories as categoriesApi, incomes as incomesApi, landlords as landlordsApi, expenses as expensesApi, employees as employeesApi, customerPayments as customerPaymentsApi } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management - all now using API data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoadingIncomes, setIsLoadingIncomes] = useState(false);

  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [isLoadingCustomerPayments, setIsLoadingCustomerPayments] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [isLoadingLandlords, setIsLoadingLandlords] = useState(false);

  const { isAuthenticated } = useAuth();

  // Function to refresh expenses from API
  const refreshExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const data = await expensesApi.getAll();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error refreshing expenses:', error);
      toast.error('Failed to refresh expenses');
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  // Function to refresh customer payments from API
  const refreshCustomerPayments = async () => {
    setIsLoadingCustomerPayments(true);
    try {
      const data = await customerPaymentsApi.getAll();
      setCustomerPayments(data.payments || []);
    } catch (error) {
      console.error('Error refreshing customer payments:', error);
      toast.error('Failed to refresh customer payments');
    } finally {
      setIsLoadingCustomerPayments(false);
    }
  };

  // Function to refresh employees from API
  const refreshEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const data = await employeesApi.getAll();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error refreshing employees:', error);
      toast.error('Failed to refresh employees');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Function to refresh customers from API
  const refreshCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
      toast.success('Customer list refreshed successfully');
    } catch (error) {
      console.error('Error refreshing customers:', error);
      toast.error('Failed to refresh customers');
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const refreshProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
      toast.success('Project list refreshed successfully');
    } catch (error) {
      console.error('Error refreshing projects:', error);
      toast.error('Failed to refresh projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const refreshCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
      toast.success('Category list refreshed successfully');
    } catch (error) {
      console.error('Error refreshing categories:', error);
      toast.error('Failed to refresh categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const refreshLandlords = async () => {
    setIsLoadingLandlords(true);
    try {
      const data = await landlordsApi.getAll();
      setLandlords(data);
      toast.success('Landlord list refreshed successfully');
    } catch (error) {
      console.error('Error refreshing landlords:', error);
      toast.error('Failed to refresh landlords');
    } finally {
      setIsLoadingLandlords(false);
    }
  };

  const refreshIncomes = async () => {
    setIsLoadingIncomes(true);
    try {
      const data = await incomesApi.getAll();
      setIncomes(data.incomes || []);
    } catch (error) {
      console.error('Error refreshing incomes:', error);
      toast.error('Failed to refresh incomes');
    } finally {
      setIsLoadingIncomes(false);
    }
  };

  // Load all data from APIs when user is authenticated
  useEffect(() => {
    const loadAllData = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated) return;

      // Load all data in parallel
      await Promise.all([
        refreshExpenses(),
        refreshCustomerPayments(),
        refreshEmployees(),
        refreshCustomers(),
        refreshProjects(),
        refreshCategories(),
        refreshLandlords(),
        refreshIncomes()
      ]);
    };

    loadAllData();
  }, [isAuthenticated]);

  // Expense CRUD operations using API
  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const response = await expensesApi.create(expense);
      setExpenses(prev => [...prev, response.expense]);
      
      // Show specific success message for salary expenses
      if (expense.category === 'office' && expense.subcategory === 'salaries' && expense.employeeId) {
        const employee = employees.find(emp => emp.id === expense.employeeId);
        const employeeName = employee?.name || 'Employee';
        toast.success(`Salary expense for ${employeeName} added successfully`);
      } else if (expense.category === 'construction' && expense.subcategory === 'land' && expense.landlordId) {
        const landlord = landlords.find(l => l.id === expense.landlordId);
        const landlordName = landlord?.name || 'Landlord';
        toast.success(`Land purchase payment to ${landlordName} added successfully`);
      } else {
        toast.success('Expense added successfully');
      }
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error(error.response?.data?.message || 'Failed to add expense');
      throw error;
    }
  };

  const updateExpense = async (id: string, expense: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const response = await expensesApi.update(id, expense);
      setExpenses(prev => prev.map(exp => 
        exp.id === id ? response.expense : exp
      ));
      
      // Show specific success message for salary expenses
      if (expense.category === 'office' && expense.subcategory === 'salaries' && expense.employeeId) {
        const employee = employees.find(emp => emp.id === expense.employeeId);
        const employeeName = employee?.name || 'Employee';
        toast.success(`Salary expense for ${employeeName} updated successfully`);
      } else if (expense.category === 'construction' && expense.subcategory === 'land' && expense.landlordId) {
        const landlord = landlords.find(l => l.id === expense.landlordId);
        const landlordName = landlord?.name || 'Landlord';
        toast.success(`Land purchase payment to ${landlordName} updated successfully`);
      } else {
        toast.success('Expense updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating expense:', error);
      toast.error(error.response?.data?.message || 'Failed to update expense');
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await expensesApi.delete(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast.success('Expense deleted successfully');
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error(error.response?.data?.message || 'Failed to delete expense');
      throw error;
    }
  };

  // Income CRUD operations (already using API)
  const addIncome = async (income: Omit<Income, 'id' | 'createdAt'>) => {
    try {
      const newIncome = await incomesApi.create(income);
      setIncomes([...incomes, newIncome]);
      toast.success('Income added successfully');
    } catch (error: any) {
      console.error('Error adding income:', error);
      toast.error(error.response?.data?.message || 'Failed to add income');
      throw error;
    }
  };

  const updateIncome = async (id: string, income: Omit<Income, 'id' | 'createdAt'>) => {
    try {
      const updatedIncome = await incomesApi.update(id, income);
      const updatedIncomes = incomes.map((inc) =>
        inc.id === id ? updatedIncome : inc
      );
      setIncomes(updatedIncomes);
      toast.success('Income updated successfully');
    } catch (error: any) {
      console.error('Error updating income:', error);
      toast.error(error.response?.data?.message || 'Failed to update income');
      throw error;
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      await incomesApi.delete(id);
      setIncomes(incomes.filter((income) => income.id !== id));
      toast.success('Income deleted successfully');
    } catch (error: any) {
      console.error('Error deleting income:', error);
      toast.error(error.response?.data?.message || 'Failed to delete income');
      throw error;
    }
  };

  const getIncomeById = async (id: string) => {
    try {
      const response = await incomesApi.getById(id);
      return response.income;
    } catch (error) {
      console.error('Error fetching income:', error);
      toast.error('Failed to fetch income details');
      return null;
    }
  };

  // Customer Payment CRUD operations using API
  const addCustomerPayment = async (payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => {
    try {
      // Map frontend payment methods to backend accepted values
      const mapPaymentMethod = (method: string) => {
        const mapping: { [key: string]: string } = {
          'credit_card': 'online',
          'debit_card': 'online', 
          'bank_transfer': 'online',
          'cash': 'cash',
          'cheque': 'cheque'
        };
        return mapping[method] || 'cash';
      };

      // Transform field names to match API expectations
      const frontendPaymentMethod = (payment as any).paymentMethod || payment.paymentMode;
      const apiPaymentData = {
        amount: payment.amount,
        date: (payment as any).paymentDate || payment.date, // Handle both field names
        description: payment.description || '', // Ensure description is not empty
        paymentMode: mapPaymentMethod(frontendPaymentMethod), // Map and transform payment method
        chequeNumber: payment.chequeNumber || '',
        transactionId: payment.transactionId || '',
        customerName: payment.customerName,
        invoiceNumber: payment.invoiceNumber || '',
        projectId: payment.projectId,
        plotNumber: payment.plotNumber,
        paymentCategory: payment.paymentCategory,
        totalPrice: payment.totalPrice,
        developmentCharges: payment.developmentCharges,
        clubhouseCharges: payment.clubhouseCharges,
        constructionCharges: payment.constructionCharges
      };

      const response = await customerPaymentsApi.create(apiPaymentData);
      setCustomerPayments(prev => [...prev, response.payment]);
      toast.success('Customer payment added successfully');
    } catch (error: any) {
      console.error('Error adding customer payment:', error);
      toast.error(error.response?.data?.message || 'Failed to add customer payment');
      throw error;
    }
  };

  const updateCustomerPayment = async (id: string, payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => {
    try {
      // Map frontend payment methods to backend accepted values
      const mapPaymentMethod = (method: string) => {
        const mapping: { [key: string]: string } = {
          'credit_card': 'online',
          'debit_card': 'online', 
          'bank_transfer': 'online',
          'cash': 'cash',
          'cheque': 'cheque'
        };
        return mapping[method] || 'cash';
      };

      // Transform field names to match API expectations
      const frontendPaymentMethod = (payment as any).paymentMethod || payment.paymentMode;
      const apiPaymentData = {
        amount: payment.amount,
        date: (payment as any).paymentDate || payment.date, // Handle both field names
        description: payment.description || '', // Ensure description is not empty
        paymentMode: mapPaymentMethod(frontendPaymentMethod), // Map and transform payment method
        chequeNumber: payment.chequeNumber || '',
        transactionId: payment.transactionId || '',
        customerName: payment.customerName,
        invoiceNumber: payment.invoiceNumber || '',
        projectId: payment.projectId,
        plotNumber: payment.plotNumber,
        paymentCategory: payment.paymentCategory,
        totalPrice: payment.totalPrice,
        developmentCharges: payment.developmentCharges,
        clubhouseCharges: payment.clubhouseCharges,
        constructionCharges: payment.constructionCharges
      };

      const response = await customerPaymentsApi.update(id, apiPaymentData);
      setCustomerPayments(prev => prev.map(pay => 
        pay.id === id ? response.payment : pay
      ));
      toast.success('Customer payment updated successfully');
    } catch (error: any) {
      console.error('Error updating customer payment:', error);
      toast.error(error.response?.data?.message || 'Failed to update customer payment');
      throw error;
    }
  };

  const deleteCustomerPayment = async (id: string) => {
    try {
      await customerPaymentsApi.delete(id);
      setCustomerPayments(prev => prev.filter(payment => payment.id !== id));
      toast.success('Customer payment deleted successfully');
    } catch (error: any) {
      console.error('Error deleting customer payment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete customer payment');
      throw error;
    }
  };

  const getCustomerPaymentById = (id: string) => {
    return customerPayments.find((payment) => payment.id === id);
  };

  // Customer CRUD operations (already using API)
  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const response = await customersApi.create(customer);
      setCustomers(prev => [...prev, response.customer]);
      toast.success('Customer added successfully');
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error(error.response?.data?.message || 'Failed to add customer');
      throw error;
    }
  };

  const updateCustomer = async (id: string, customer: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const response = await customersApi.update(id, customer);
      setCustomers(prev => prev.map(cust => 
        cust.id === id ? response.customer : cust
      ));
      toast.success('Customer updated successfully');
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error(error.response?.data?.message || 'Failed to update customer');
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    // Check if customer has any payments
    const hasPayments = customerPayments.some(payment => 
      payment.customerName === customers.find(c => c.id === id)?.name
    );
    
    if (hasPayments) {
      toast.error('Cannot delete customer with existing payments');
      return;
    }
    
    try {
      await customersApi.delete(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      toast.success('Customer deleted successfully');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.response?.data?.message || 'Failed to delete customer');
      throw error;
    }
  };

  const getCustomerById = (id: string) => {
    return customers.find((customer) => customer.id === id);
  };

  // Project CRUD operations (already using API)
  const addProject = async (project: Omit<Project, '_id'>) => {
    try {
      const response = await projectsApi.create(project);
      setProjects(prev => [...prev, response.project]);
      toast.success('Project added successfully');
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast.error(error.response?.data?.message || 'Failed to add project');
      throw error;
    }
  };

  const updateProject = async (id: string, project: Omit<Project, '_id'>) => {
    try {
      const response = await projectsApi.update(id, project);
      setProjects(prev => prev.map(proj => 
        proj._id === id ? response.project : proj
      ));
      toast.success('Project updated successfully');
      // Refresh projects list to ensure consistency
      await refreshProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.response?.data?.message || 'Failed to update project');
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    // Check if there are expenses with this project
    const hasExpenses = expenses.some(expense => expense.projectId === id);
    
    if (hasExpenses) {
      toast.error('Cannot delete project with existing expenses');
      return;
    }
    
    try {
      await projectsApi.delete(id);
      setProjects(prev => prev.filter(project => project._id !== id));
      toast.success('Project deleted successfully');
      // Refresh projects list to ensure consistency
      await refreshProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
      throw error;
    }
  };

  const getProjectById = (id: string) => {
    return projects.find((project) => project._id === id);
  };

  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  const getSubCategoryById = (categoryId: string, subcategoryId: string) => {
    const category = categories.find((category) => category.id === categoryId);
    return category?.subcategories.find((subcategory) => subcategory.id === subcategoryId);
  };

  // Category CRUD operations using API
  const addCategory = async (category: Omit<Category, 'createdAt'>) => {
    try {
      const response = await categoriesApi.create(category);
      setCategories(prev => [...prev, response.category]);
      toast.success('Category added successfully');
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.message || 'Failed to add category');
      throw error;
    }
  };

  const updateCategory = async (id: string, category: Omit<Category, 'createdAt'>) => {
    try {
      const response = await categoriesApi.update(id, category);
      setCategories(prev => prev.map(cat => 
        cat.id === id ? response.category : cat
      ));
      toast.success('Category updated successfully');
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    // Check if category has any expenses
    const hasExpenses = expenses.some(expense => expense.category === id);
    
    if (hasExpenses) {
      toast.error('Cannot delete category with existing expenses');
      return;
    }
    
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(category => category.id !== id));
      toast.success('Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
      throw error;
    }
  };

  // Employee CRUD operations using API
  const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt'>) => {
    try {
      const response = await employeesApi.create(employee);
      setEmployees(prev => [...prev, response.employee]);
      toast.success('Employee added successfully');
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast.error(error.response?.data?.message || 'Failed to add employee');
      throw error;
    }
  };

  const updateEmployee = async (id: string, employee: Omit<Employee, 'id' | 'createdAt'>) => {
    try {
      const response = await employeesApi.update(id, employee);
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? response.employee : emp
      ));
      toast.success('Employee updated successfully');
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast.error(error.response?.data?.message || 'Failed to update employee');
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await employeesApi.delete(id);
      setEmployees(prev => prev.filter(employee => employee.id !== id));
      toast.success('Employee deleted successfully');
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast.error(error.response?.data?.message || 'Failed to delete employee');
      throw error;
    }
  };

  const getEmployeeById = (id: string) => {
    return employees.find((employee) => employee.id === id);
  };

  // Landlord CRUD operations (already using API)
  const addLandlord = async (landlord: Omit<Landlord, 'id' | 'createdAt' | 'totalLandPrice'>) => {
    try {
      // Calculate total land price
      const totalLandPrice = landlord.pricePerAcre * landlord.totalExtent;
      const landlordData = {
        ...landlord,
        totalLandPrice
      };
      
      const response = await landlordsApi.create(landlordData);
      setLandlords(prev => [...prev, response.landlord]);
      toast.success('Landlord added successfully');
    } catch (error: any) {
      console.error('Error adding landlord:', error);
      toast.error(error.response?.data?.message || 'Failed to add landlord');
      throw error;
    }
  };

  const updateLandlord = async (id: string, landlord: Omit<Landlord, 'id' | 'createdAt' | 'totalLandPrice'>) => {
    try {
      // Calculate total land price
      const totalLandPrice = landlord.pricePerAcre * landlord.totalExtent;
      const landlordData = {
        ...landlord,
        totalLandPrice
      };
      
      const response = await landlordsApi.update(id, landlordData);
      setLandlords(prev => prev.map(land => 
        land.id === id ? response.landlord : land
      ));
      toast.success('Landlord updated successfully');
    } catch (error: any) {
      console.error('Error updating landlord:', error);
      toast.error(error.response?.data?.message || 'Failed to update landlord');
      throw error;
    }
  };

  const deleteLandlord = async (id: string) => {
    // Check if landlord has any expenses
    const hasExpenses = expenses.some(expense => expense.landlordId === id);
    
    if (hasExpenses) {
      toast.error('Cannot delete landlord with existing expenses');
      return;
    }
    
    try {
      await landlordsApi.delete(id);
      setLandlords(prev => prev.filter(landlord => landlord.id !== id));
      toast.success('Landlord deleted successfully');
    } catch (error: any) {
      console.error('Error deleting landlord:', error);
      toast.error(error.response?.data?.message || 'Failed to delete landlord');
      throw error;
    }
  };

  const getLandlordById = async (id: string) => {
    try {
      // First check if we have it in state
      const landlordInState = landlords.find(landlord => landlord.id === id);
      if (landlordInState) return landlordInState;
      
      // If not in state, fetch from API
      const response = await landlordsApi.getById(id);
      return response;
    } catch (error) {
      console.error('Error fetching landlord:', error);
      toast.error('Failed to fetch landlord details');
      return undefined;
    }
  };

  const value: ExpenseContextType = {
    expenses,
    incomes,
    customerPayments,
    customers,
    projects,
    categories,
    employees,
    landlords,
    isLoadingCustomers,
    isLoadingProjects,
    isLoadingCategories,
    isLoadingIncomes,
    isLoadingLandlords,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    getIncomeById,
    refreshIncomes,
    addCustomerPayment,
    updateCustomerPayment,
    deleteCustomerPayment,
    getCustomerPaymentById,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    refreshCustomers,
    refreshProjects,
    refreshCategories,
    refreshLandlords,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getCategoryById,
    getSubCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    addLandlord,
    updateLandlord,
    deleteLandlord,
    getLandlordById,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
