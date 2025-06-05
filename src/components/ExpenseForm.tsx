import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Expense, PaymentMode } from '../types';
import { ArrowLeft, Calendar, DollarSign, CreditCard, Wallet, FileCheck, Users } from 'lucide-react';
import { format } from 'date-fns';
import { categoryIcons } from '../data/mockData';

interface ExpenseFormProps {
  expenseId?: string | null;
  onComplete: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expenseId, onComplete }) => {
  const { addExpense, updateExpense, expenses, projects = [], categories = [], employees = [] } = useExpenses();
  
  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'createdAt'> & {
    employeeId?: string;
    salaryMonth?: string;
    overrideSalary?: number;
  }>({
    projectId: projects[0]?.id || '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    category: categories[0]?.id || '',
    subcategory: categories[0]?.subcategories?.[0]?.id || '',
    description: '',
    paymentMode: 'cash',
    chequeNumber: '',
    transactionId: '',
    employeeId: '',
    salaryMonth: format(new Date(), 'yyyy-MM'),
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = Boolean(expenseId);
  const isSalaryExpense = formData.category === 'office' && formData.subcategory === 'salaries';
  
  useEffect(() => {
    if (expenseId) {
      const expense = expenses?.find((e) => e.id === expenseId);
      if (expense) {
        setFormData({
          ...expense,
          employeeId: (expense as any).employeeId || '',
          salaryMonth: (expense as any).salaryMonth || format(new Date(), 'yyyy-MM'),
          overrideSalary: (expense as any).overrideSalary,
        });
      }
    }
  }, [expenseId, expenses]);

  useEffect(() => {
    if (isSalaryExpense && formData.employeeId && !formData.overrideSalary) {
      const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
      if (selectedEmployee) {
        setFormData(prev => ({
          ...prev,
          amount: selectedEmployee.salary
        }));
      }
    }
  }, [formData.employeeId, isSalaryExpense, employees]);
  
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

    if (formData.paymentMode === 'cheque' && !formData.chequeNumber?.trim()) {
      newErrors.chequeNumber = 'Cheque number is required';
    }

    if (formData.paymentMode === 'online' && !formData.transactionId?.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    }

    if (isSalaryExpense) {
      if (!formData.employeeId) {
        newErrors.employeeId = 'Employee is required';
      }
      if (!formData.salaryMonth) {
        newErrors.salaryMonth = 'Salary month is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const expenseData = {
      ...formData,
      description: isSalaryExpense 
        ? `Salary payment for ${employees.find(e => e.id === formData.employeeId)?.name} - ${format(new Date(formData.salaryMonth + '-01'), 'MMMM yyyy')}`
        : formData.description
    };
    
    if (isEditMode && expenseId) {
      updateExpense(expenseId, expenseData);
    } else {
      addExpense(expenseData);
    }
    
    onComplete();
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      const selectedCategory = categories.find(c => c.id === value);
      setFormData({
        ...formData,
        category: value,
        subcategory: selectedCategory?.subcategories?.[0]?.id || '',
      });
    } else if (name === 'paymentMode') {
      setFormData({
        ...formData,
        paymentMode: value as PaymentMode,
        chequeNumber: value === 'cheque' ? formData.chequeNumber : '',
        transactionId: value === 'online' ? formData.transactionId : '',
      });
    } else if (name === 'employeeId' && !formData.overrideSalary) {
      const selectedEmployee = employees.find(emp => emp.id === value);
      setFormData({
        ...formData,
        employeeId: value,
        amount: selectedEmployee?.salary || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'amount' || name === 'overrideSalary' ? parseFloat(value) || 0 : value,
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.category);

  const paymentModes = [
    { id: 'cash', name: 'Cash', icon: Wallet },
    { id: 'online', name: 'Online Transfer', icon: CreditCard },
    { id: 'cheque', name: 'Cheque', icon: FileCheck },
  ];
  
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
                {(projects || []).map((project) => (
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
                  <span className="text-gray-500">₹</span>
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
                  disabled={isSalaryExpense && !formData.overrideSalary}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(categories || []).map((category) => {
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
                      className={`cursor-pointer flex items-center p-4 rounded-lg transition-colors ${
                        formData.category === category.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {Icon && <Icon size={24} className={`${formData.category === category.id ? 'text-blue-600' : 'text-gray-600'} mr-3`} />}
                      <span className={`text-lg ${formData.category === category.id ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
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
            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(selectedCategory.subcategories || []).map((subcategory) => {
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
                        {Icon && <Icon size={16} className={`${formData.subcategory === subcategory.id ? 'text-blue-600' : 'text-gray-600'} mr-2`} />}
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

            {/* Employee Details (shown only for salary expenses) */}
            {isSalaryExpense && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-900">Employee Details</h3>
                
                {/* Employee Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Employee
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users size={18} className="text-gray-400" />
                    </div>
                    <select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.employeeId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select an employee</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} - {employee.employeeId}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.employeeId && (
                    <p className="mt-1 text-sm text-red-500">{errors.employeeId}</p>
                  )}
                </div>

                {/* Salary Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Month
                  </label>
                  <input
                    type="month"
                    name="salaryMonth"
                    value={formData.salaryMonth}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.salaryMonth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.salaryMonth && (
                    <p className="mt-1 text-sm text-red-500">{errors.salaryMonth}</p>
                  )}
                </div>

                {/* Override Salary Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="overrideSalary"
                    checked={Boolean(formData.overrideSalary)}
                    onChange={(e) => {
                      const employee = employees.find(emp => emp.id === formData.employeeId);
                      setFormData(prev => ({
                        ...prev,
                        overrideSalary: e.target.checked ? (employee?.salary || 0) : undefined,
                        amount: e.target.checked ? (employee?.salary || 0) : (employee?.salary || 0)
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="overrideSalary" className="ml-2 block text-sm text-gray-700">
                    Override default salary amount
                  </label>
                </div>

                {/* Override Salary Amount */}
                {formData.overrideSalary !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Override Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        type="number"
                        name="overrideSalary"
                        value={formData.overrideSalary}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            overrideSalary: value,
                            amount: value
                          }));
                        }}
                        min="0"
                        step="1000"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {paymentModes.map(({ id, name, icon: Icon }) => (
                  <div
                    key={id}
                    onClick={() => handleChange({ target: { name: 'paymentMode', value: id } } as any)}
                    className={`cursor-pointer flex items-center p-3 rounded-lg transition-colors ${
                      formData.paymentMode === id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className={`${formData.paymentMode === id ? 'text-blue-600' : 'text-gray-600'} mr-2`} />
                    <span className={`text-sm ${formData.paymentMode === id ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cheque Number (shown only when payment mode is cheque) */}
            {formData.paymentMode === 'cheque' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cheque Number
                </label>
                <input
                  type="text"
                  name="chequeNumber"
                  value={formData.chequeNumber}
                  onChange={handleChange}
                  placeholder="Enter cheque number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.chequeNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.chequeNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.chequeNumber}</p>
                )}
              </div>
            )}

            {/* Transaction ID (shown only when payment mode is online) */}
            {formData.paymentMode === 'online' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  placeholder="Enter transaction ID"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.transactionId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.transactionId && (
                  <p className="mt-1 text-sm text-red-500">{errors.transactionId}</p>
                )}
              </div>
            )}
            
            {/* Description */}
            {!isSalaryExpense && (
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
            )}
            
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