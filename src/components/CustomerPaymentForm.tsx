import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { PaymentMode, PaymentType } from '../types';
import { ArrowLeft, Wallet, CreditCard, FileCheck } from 'lucide-react';

interface CustomerPaymentFormProps {
  paymentId?: string | null;
  onComplete: () => void;
}

const CustomerPaymentForm: React.FC<CustomerPaymentFormProps> = ({ paymentId, onComplete }) => {
  const { addCustomerPayment, updateCustomerPayment, getCustomerPaymentById, projects } = useExpenses();
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    invoiceNumber: '',
    projectId: projects[0]?.id || '',
    paymentMode: 'cash' as PaymentMode,
    chequeNumber: '',
    transactionId: '',
    plotNumber: '',
    paymentType: 'token' as PaymentType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (paymentId) {
      const payment = getCustomerPaymentById(paymentId);
      if (payment) {
        setFormData({
          amount: payment.amount.toString(),
          description: payment.description,
          date: new Date(payment.date).toISOString().split('T')[0],
          customerName: payment.customerName,
          invoiceNumber: payment.invoiceNumber || '',
          projectId: payment.projectId,
          paymentMode: payment.paymentMode,
          chequeNumber: payment.chequeNumber || '',
          transactionId: payment.transactionId || '',
          plotNumber: payment.plotNumber,
          paymentType: payment.paymentType,
        });
      }
    }
  }, [paymentId, getCustomerPaymentById]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (!formData.plotNumber.trim()) {
      newErrors.plotNumber = 'Plot number is required';
    }

    if (!formData.paymentType) {
      newErrors.paymentType = 'Payment type is required';
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

    const paymentData = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: new Date(formData.date).toISOString(),
      customerName: formData.customerName,
      invoiceNumber: formData.invoiceNumber || undefined,
      projectId: formData.projectId,
      paymentMode: formData.paymentMode,
      chequeNumber: formData.paymentMode === 'cheque' ? formData.chequeNumber : undefined,
      transactionId: formData.paymentMode === 'online' ? formData.transactionId : undefined,
      plotNumber: formData.plotNumber,
      paymentType: formData.paymentType,
    };

    if (paymentId) {
      updateCustomerPayment(paymentId, paymentData);
    } else {
      addCustomerPayment(paymentData);
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

  const paymentTypes = [
    { id: 'token', name: 'Token Amount' },
    { id: 'booking', name: 'Booking Amount' },
    { id: 'advance', name: 'Advance Payment' },
    { id: 'construction', name: 'Construction Payment' },
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
          {paymentId ? 'Edit Customer Payment' : 'Add Customer Payment'}
        </h1>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-500">{errors.projectId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plot Number
            </label>
            <input
              type="text"
              name="plotNumber"
              value={formData.plotNumber}
              onChange={handleChange}
              placeholder="Enter plot number"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.plotNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.plotNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.plotNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentTypes.map(({ id, name }) => (
                <div
                  key={id}
                  onClick={() => handleChange({ target: { name: 'paymentType', value: id } } as any)}
                  className={`cursor-pointer flex items-center p-3 rounded-lg transition-colors ${
                    formData.paymentType === id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-sm ${formData.paymentType === id ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
            {errors.paymentType && (
              <p className="mt-1 text-sm text-red-500">{errors.paymentType}</p>
            )}
          </div>

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
              Customer Name
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Enter customer name"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.customerName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              placeholder="Enter invoice number (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
              {paymentId ? 'Update Payment' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerPaymentForm;