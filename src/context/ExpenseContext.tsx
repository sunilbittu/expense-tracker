import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Expense, Project, Category, SubCategory, ExpenseContextType } from '../types';
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

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        projects,
        categories,
        addExpense,
        updateExpense,
        deleteExpense,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
        getCategoryById,
        getSubCategoryById,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};