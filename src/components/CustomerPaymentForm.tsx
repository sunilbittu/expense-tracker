import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { PaymentCategory } from '../types';
import { ArrowLeft, Building2, Users, Receipt } from 'lucide-react';

const CustomerPaymentForm = () => {
  const { addCustomerPayment, customers, projects } = useExpenses();
  const [formData, setFormData] = useState({
    customerId: '',
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

  // Auto-fill customer details when a customer is selected
  useEffect(() => {
    if (formData.customerId) {
      const selectedCustomer = customers.find(c => c.id === formData.customerId);
      if (selectedCustomer) {
        setFormData(prev => ({
          ...prev,
          customerName: selectedCustomer.name,
          plotNumber: selectedCustomer.plotNumber,
          projectId: selectedCustomer.projectId,
          totalPrice: selectedCustomer.salePrice.toString(),
          constructionCharges: selectedCustomer.constructionPrice.toString(),
        }));
      }
    }
  }, [formData.customerId, customers]);

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
      customerId: '',
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
        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
          Select Customer
        </label>
        <select
          id="customerId"
          name="customerId"
          value={formData.customerId}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name} - Plot {customer.plotNumber}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
          Project
        </label>
        <select
          id="projectId"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          required
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
        >
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
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
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
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
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
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
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
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