import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Expense, Project, Category, Income, CustomerPayment, Customer, ExpenseContextType } from '../types';
import { defaultCategories, defaultProjects } from '../data/mockData';
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

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem('incomes');
    return saved ? JSON.parse(saved) : [];
  });

  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(() => {
    const saved = localStorage.getItem('customerPayments');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : defaultProjects;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('customerPayments', JSON.stringify(customerPayments));
  }, [customerPayments]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense = {
      ...expense,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setExpenses([...expenses, newExpense]);
    toast.success('Expense added successfully');
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
    toast.success('Expense updated successfully');
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
    toast.success('Expense deleted successfully');
  };

  const addIncome = (income: Omit<Income, 'id' | 'createdAt'>) => {
    const newIncome = {
      ...income,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setIncomes([...incomes, newIncome]);
    toast.success('Income added successfully');
  };

  const updateIncome = (id: string, income: Omit<Income, 'id' | 'createdAt'>) => {
    const updatedIncomes = incomes.map((inc) =>
      inc.id === id
        ? {
            ...inc,
            ...income,
          }
        : inc
    );
    setIncomes(updatedIncomes);
    toast.success('Income updated successfully');
  };

  const deleteIncome = (id: string) => {
    setIncomes(incomes.filter((income) => income.id !== id));
    toast.success('Income deleted successfully');
  };

  const getIncomeById = (id: string) => {
    return incomes.find((income) => income.id === id);
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

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer = {
      ...customer,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setCustomers([...customers, newCustomer]);
    toast.success('Customer added successfully');
  };

  const updateCustomer = (id: string, customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const updatedCustomers = customers.map((cust) =>
      cust.id === id
        ? {
            ...cust,
            ...customer,
          }
        : cust
    );
    setCustomers(updatedCustomers);
    toast.success('Customer updated successfully');
  };

  const deleteCustomer = (id: string) => {
    // Check if customer has any payments
    const hasPayments = customerPayments.some(payment => 
      payment.customerName === customers.find(c => c.id === id)?.name
    );
    
    if (hasPayments) {
      toast.error('Cannot delete customer with existing payments');
      return;
    }
    
    setCustomers(customers.filter((customer) => customer.id !== id));
    toast.success('Customer deleted successfully');
  };

  const getCustomerById = (id: string) => {
    return customers.find((customer) => customer.id === id);
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = {
      ...project,
      id: uuidv4(),
    };
    setProjects([...projects, newProject]);
    toast.success('Project added successfully');
  };

  const updateProject = (id: string, project: Omit<Project, 'id'>) => {
    const updatedProjects = projects.map((proj) =>
      proj.id === id
        ? {
            ...proj,
            ...project,
          }
        : proj
    );
    setProjects(updatedProjects);
    toast.success('Project updated successfully');
  };

  const deleteProject = (id: string) => {
    // Check if there are expenses with this project
    const hasExpenses = expenses.some(expense => expense.projectId === id);
    
    if (hasExpenses) {
      toast.error('Cannot delete project with existing expenses');
      return;
    }
    
    setProjects(projects.filter((project) => project.id !== id));
    toast.success('Project deleted successfully');
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

  const value: ExpenseContextType = {
    expenses,
    incomes,
    customerPayments,
    customers,
    projects,
    categories,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    getIncomeById,
    addCustomerPayment,
    updateCustomerPayment,
    deleteCustomerPayment,
    getCustomerPaymentById,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getCategoryById,
    getSubCategoryById,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};