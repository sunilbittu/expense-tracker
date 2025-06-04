import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Expense } from '../types';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { categoryIcons } from '../data/mockData';

interface ExpenseFormProps {
  expenseId?: string | null;
  onComplete: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expenseId, onComplete }) => {
  const { addExpense, updateExpense, expenses, projects, categories } = useExpenses();
  
  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'createdAt'>>({
    projectId: projects?.[0]?.id || '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    category: categories?.[0]?.id || '',
    subcategory: categories?.[0]?.subcategories?.[0]?.id || '',
    description: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = Boolean(expenseId);
  
  useEffect(() => {
    if (expenseId) {
      const expense = expenses?.find((e) => e.id === expenseId);
      if (expense) {
        setFormData({
          projectId: expense.projectId,
          amount: expense.amount,
          date: expense.date,
          category: expense.category,
          subcategory: expense.subcategory,
          description: expense.description,
        });
      }
    }
  }, [expenseId, expenses]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.subcategory) {
      newErrors.subcategory = 'Subcategory is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (isEditMode && expenseId) {
      updateExpense(expenseId, formData);
    } else {
      addExpense(formData);
    }
    
    onComplete();
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      // When category changes, reset subcategory to first available option
      const category = categories?.find(c => c.id === value);
      setFormData({
        ...formData,
        category: value,
        subcategory: category?.subcategories?.[0]?.id || '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'amount' ? parseFloat(value) || 0 : value,
      });
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const selectedCategory = categories?.find(c => c.id === formData.category);
  
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <button
          onClick={onComplete}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Expense' : 'Add New Expense'}
        </h1>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.projectId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="" disabled>
                  Select a project
                </option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-500">{errors.projectId}</p>
              )}
            </div>
            
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DollarSign size={18} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
            
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories?.map((category) => {
                  const Icon = categoryIcons[category.icon];
                  return (
                    <div
                      key={category.id}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          category: category.id,
                          subcategory: category.subcategories?.[0]?.id || '',
                        });
                      }}
                      className={`cursor-pointer flex flex-col items-center p-3 rounded-lg transition-colors ${
                        formData.category === category.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {Icon && <Icon size={20} className={formData.category === category.id ? 'text-blue-600' : 'text-gray-600'} />}
                      <span className={`mt-1 text-sm ${formData.category === category.id ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                        {category.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>
            
            {/* Subcategory */}
            {selectedCategory?.subcategories?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedCategory.subcategories.map((subcategory) => {
                    const Icon = categoryIcons[subcategory.icon];
                    return (
                      <div
                        key={subcategory.id}
                        onClick={() => setFormData({ ...formData, subcategory: subcategory.id })}
                        className={`cursor-pointer flex items-center p-3 rounded-lg transition-colors ${
                          formData.subcategory === subcategory.id
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {Icon && <Icon size={16} className={formData.subcategory === subcategory.id ? 'text-blue-600 mr-2' : 'text-gray-600 mr-2'} />}
                        <span className={`text-sm ${formData.subcategory === subcategory.id ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                          {subcategory.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {errors.subcategory && (
                  <p className="mt-1 text-sm text-red-500">{errors.subcategory}</p>
                )}
              </div>
            )}
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Enter a description"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                {isEditMode ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;