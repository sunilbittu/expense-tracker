import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { PaymentMode } from '../types';
import { ArrowLeft, Wallet, CreditCard, FileCheck } from 'lucide-react';

interface IncomeFormProps {
  incomeId?: string | null;
  onComplete: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ incomeId, onComplete }) => {
  const { addIncome, updateIncome, getIncomeById } = useExpenses();
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    source: '',
    payee: '',
    paymentMode: 'cash' as PaymentMode,
    chequeNumber: '',
    transactionId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (incomeId) {
      const income = getIncomeById(incomeId);
      if (income) {
        setFormData({
          amount: income.amount.toString(),
          description: income.description,
          date: new Date(income.date).toISOString().split('T')[0],
          source: income.source,
          payee: income.payee || '',
          paymentMode: income.paymentMode,
          chequeNumber: income.chequeNumber || '',
          transactionId: income.transactionId || '',
        });
      }
    }
  }, [incomeId, getIncomeById]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }

    if (!formData.payee.trim()) {
      newErrors.payee = 'Payee name is required';
    }

    if (formData.paymentMode === 'cheque' && !formData.chequeNumber?.trim()) {
      newErrors.chequeNumber = 'Cheque number is required';
    }

    if (formData.paymentMode === 'online' && !formData.transactionId?.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const incomeData = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: new Date(formData.date).toISOString(),
      source: formData.source,
      payee: formData.payee,
      paymentMode: formData.paymentMode,
      chequeNumber: formData.paymentMode === 'cheque' ? formData.chequeNumber : undefined,
      transactionId: formData.paymentMode === 'online' ? formData.transactionId : undefined,
    };

    if (incomeId) {
      updateIncome(incomeId, incomeData);
    } else {
      addIncome(incomeData);
    }

    onComplete();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

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
          {incomeId ? 'Edit Income' : 'Add New Income'}
        </h1>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g., Salary, Freelance Work, Investment"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.source ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.source && (
              <p className="mt-1 text-sm text-red-500">{errors.source}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payee Name
            </label>
            <input
              type="text"
              name="payee"
              value={formData.payee}
              onChange={handleChange}
              placeholder="Enter the name of the person or organization"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.payee ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.payee && (
              <p className="mt-1 text-sm text-red-500">{errors.payee}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

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
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onComplete}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {incomeId ? 'Update Income' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeForm;