import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Expense, Project, Category, Income, CustomerPayment, Customer, ExpenseContextType, Employee, Landlord } from '../types';
import { defaultCategories, defaultProjects } from '../data/mockData';
import { customers as customersApi, projects as projectsApi, categories as categoriesApi, incomes as incomesApi } from '../services/api';
import toast from 'react-hot-toast';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoadingIncomes, setIsLoadingIncomes] = useState(false);

  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(() => {
    const saved = localStorage.getItem('customerPayments');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

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

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Function to refresh projects from API
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Function to refresh categories from API
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

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : [];
  });

  const [landlords, setLandlords] = useState<Landlord[]>(() => {
    const saved = localStorage.getItem('landlords');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Function to refresh incomes from API
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

  useEffect(() => {
    localStorage.setItem('customerPayments', JSON.stringify(customerPayments));
  }, [customerPayments]);

  // Load customers from API on mount
  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const data = await customersApi.getAll();
        setCustomers(data);
      } catch (error) {
        console.error('Error loading customers:', error);
        toast.error('Failed to load customers');
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    // Only load if we have a token (user is authenticated)
    const token = localStorage.getItem('token');
    if (token) {
      loadCustomers();
    }
  }, []);

  // Load projects from API on mount
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const data = await projectsApi.getAll();
        setProjects(data);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast.error('Failed to load projects');
        // Fallback to default projects if API fails
        setProjects(defaultProjects);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    // Only load if we have a token (user is authenticated)
    const token = localStorage.getItem('token');
    if (token) {
      loadProjects();
    } else {
      // Use default projects when not authenticated
      setProjects(defaultProjects);
    }
  }, []);

  // Load incomes from API on mount
  useEffect(() => {
    const loadIncomes = async () => {
      setIsLoadingIncomes(true);
      try {
        const data = await incomesApi.getAll();
        setIncomes(data.incomes || []);
      } catch (error) {
        console.error('Error loading incomes:', error);
        toast.error('Failed to load incomes');
      } finally {
        setIsLoadingIncomes(false);
      }
    };

    // Only load if we have a token (user is authenticated)
    const token = localStorage.getItem('token');
    if (token) {
      loadIncomes();
    }
  }, []);

  // Load categories from API on mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await categoriesApi.getAll();
        if (data.length === 0) {
          // Initialize default categories if none exist
          const initResponse = await categoriesApi.initDefaults();
          setCategories(initResponse.categories);
        } else {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load categories');
        // Fallback to default categories if API fails
        setCategories(defaultCategories);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    // Only load if we have a token (user is authenticated)
    const token = localStorage.getItem('token');
    if (token) {
      loadCategories();
    } else {
      // Use default categories when not authenticated
      setCategories(defaultCategories);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('landlords', JSON.stringify(landlords));
  }, [landlords]);

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setExpenses([...expenses, newExpense]);
    
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
  };

  const updateExpense = (id: string, expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const updatedExpenses = expenses.map((exp) =>
      exp.id === id
        ? {
            ...exp,
            ...expense,
          }
        : exp
    );
    setExpenses(updatedExpenses);
    
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
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
    toast.success('Expense deleted successfully');
  };

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

  const addCustomerPayment = (payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => {
    const newPayment = {
      ...payment,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setCustomerPayments([...customerPayments, newPayment]);
    toast.success('Customer payment added successfully');
  };

  const updateCustomerPayment = (id: string, payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => {
    const updatedPayments = customerPayments.map((pay) =>
      pay.id === id
        ? {
            ...pay,
            ...payment,
          }
        : pay
    );
    setCustomerPayments(updatedPayments);
    toast.success('Customer payment updated successfully');
  };

  const deleteCustomerPayment = (id: string) => {
    setCustomerPayments(customerPayments.filter((payment) => payment.id !== id));
    toast.success('Customer payment deleted successfully');
  };

  const getCustomerPaymentById = (id: string) => {
    return customerPayments.find((payment) => payment.id === id);
  };

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

  const addProject = async (project: Omit<Project, 'id'>) => {
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

  const updateProject = async (id: string, project: Omit<Project, 'id'>) => {
    try {
      const response = await projectsApi.update(id, project);
      setProjects(prev => prev.map(proj => 
        proj.id === id ? response.project : proj
      ));
      toast.success('Project updated successfully');
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
      setProjects(prev => prev.filter(project => project.id !== id));
      toast.success('Project deleted successfully');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
      throw error;
    }
  };

  const getProjectById = (id: string) => {
    return projects.find((project) => project.id === id);
  };

  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  const getSubCategoryById = (categoryId: string, subcategoryId: string) => {
    const category = categories.find((category) => category.id === categoryId);
    return category?.subcategories.find((subcategory) => subcategory.id === subcategoryId);
  };

  const addEmployee = (employee: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmployee = {
      ...employee,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setEmployees([...employees, newEmployee]);
    toast.success('Employee added successfully');
  };

  const updateEmployee = (id: string, employee: Omit<Employee, 'id' | 'createdAt'>) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === id
        ? {
            ...emp,
            ...employee,
          }
        : emp
    );
    setEmployees(updatedEmployees);
    toast.success('Employee updated successfully');
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter((employee) => employee.id !== id));
    toast.success('Employee deleted successfully');
  };

  const getEmployeeById = (id: string) => {
    return employees.find((employee) => employee.id === id);
  };

  const addLandlord = (landlord: Omit<Landlord, 'id' | 'createdAt' | 'totalLandPrice'>) => {
    const totalLandPrice = landlord.pricePerAcre * landlord.totalExtent;
    const newLandlord: Landlord = {
      ...landlord,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      totalLandPrice,
    };
    setLandlords([...landlords, newLandlord]);
    toast.success('Landlord added successfully');
  };

  const updateLandlord = (id: string, landlord: Omit<Landlord, 'id' | 'createdAt' | 'totalLandPrice'>) => {
    const totalLandPrice = landlord.pricePerAcre * landlord.totalExtent;
    const updatedLandlords = landlords.map((land) =>
      land.id === id
        ? {
            ...land,
            ...landlord,
            totalLandPrice,
          }
        : land
    );
    setLandlords(updatedLandlords);
    toast.success('Landlord updated successfully');
  };

  const deleteLandlord = (id: string) => {
    setLandlords(landlords.filter((landlord) => landlord.id !== id));
    toast.success('Landlord deleted successfully');
  };

  const getLandlordById = (id: string) => {
    return landlords.find((landlord) => landlord.id === id);
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
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getCategoryById,
    getSubCategoryById,
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