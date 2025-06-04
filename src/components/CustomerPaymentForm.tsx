import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { PaymentCategory } from '../types';
import { ArrowLeft, Building2, Users, Receipt } from 'lucide-react';

const CustomerPaymentForm = () => {
  const { addCustomerPayment } = useExpenses();
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    paymentDate: '',
    paymentMethod: 'credit_card',
    plotNumber: '',
    description: '',
    paymentCategory: 'token' as PaymentCategory,
    totalPrice: '',
    developmentCharges: '',
    clubhouseCharges: '',
    constructionCharges: '',
    projectId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomerPayment({
      ...formData,
      amount: parseFloat(formData.amount),
      totalPrice: parseFloat(formData.totalPrice),
      developmentCharges: parseFloat(formData.developmentCharges),
      clubhouseCharges: parseFloat(formData.clubhouseCharges),
      constructionCharges: parseFloat(formData.constructionCharges),
      type: 'payment',
      id: Date.now().toString(),
      date: formData.paymentDate
    });
    setFormData({
      customerName: '',
      amount: '',
      paymentDate: '',
      paymentMethod: 'credit_card',
      plotNumber: '',
      description: '',
      paymentCategory: 'token',
      totalPrice: '',
      developmentCharges: '',
      clubhouseCharges: '',
      constructionCharges: '',
      projectId: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const paymentCategories = [
    { id: 'token', name: 'Token Amount' },
    { id: 'advance', name: 'Advance Payment' },
    { id: 'booking', name: 'Booking Payment' },
    { id: 'construction', name: 'Construction Payment' },
    { id: 'development', name: 'Development Charges' },
    { id: 'clubhouse', name: 'Clubhouse Charges' },
    { id: 'final', name: 'Final Payment' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
          Customer Name
        </label>
        <input
          type="text"
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="plotNumber" className="block text-sm font-medium text-gray-700">
          Plot Number
        </label>
        <input
          type="text"
          id="plotNumber"
          name="plotNumber"
          value={formData.plotNumber}
          onChange={handleChange}
          required
          placeholder="Enter plot number"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="paymentCategory" className="block text-sm font-medium text-gray-700">
          Payment Category
        </label>
        <select
          id="paymentCategory"
          name="paymentCategory"
          value={formData.paymentCategory}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {paymentCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700">
          Total Price
        </label>
        <input
          type="number"
          id="totalPrice"
          name="totalPrice"
          value={formData.totalPrice}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Payment Amount
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="developmentCharges" className="block text-sm font-medium text-gray-700">
          Development Charges
        </label>
        <input
          type="number"
          id="developmentCharges"
          name="developmentCharges"
          value={formData.developmentCharges}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="clubhouseCharges" className="block text-sm font-medium text-gray-700">
          Clubhouse Charges
        </label>
        <input
          type="number"
          id="clubhouseCharges"
          name="clubhouseCharges"
          value={formData.clubhouseCharges}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="constructionCharges" className="block text-sm font-medium text-gray-700">
          Construction Charges
        </label>
        <input
          type="number"
          id="constructionCharges"
          name="constructionCharges"
          value={formData.constructionCharges}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
          Payment Date
        </label>
        <input
          type="date"
          id="paymentDate"
          name="paymentDate"
          value={formData.paymentDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="credit_card">Credit Card</option>
          <option value="debit_card">Debit Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Submit Payment
      </button>
    </form>
  );
};

export default CustomerPaymentForm;