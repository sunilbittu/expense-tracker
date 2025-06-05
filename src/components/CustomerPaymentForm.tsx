import React, { useState, useEffect, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { PaymentCategory } from '../types';
import { ArrowLeft, Building2, Users, Receipt, Search, RefreshCw, ChevronDown } from 'lucide-react';

const CustomerPaymentForm = () => {
  const { addCustomerPayment, customers, projects, refreshCustomers, isLoadingCustomers } = useExpenses();
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

  // Customer selection enhancements
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isRefreshingCustomers, setIsRefreshingCustomers] = useState(false);

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) {
      return customers;
    }
    const query = customerSearchQuery.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(query) ||
      customer.plotNumber.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      projects.find(p => p.id === customer.projectId)?.name.toLowerCase().includes(query)
    );
  }, [customers, customerSearchQuery, projects]);

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
        setCustomerSearchQuery(selectedCustomer.name);
        setIsCustomerDropdownOpen(false);
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
    setCustomerSearchQuery('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomerSelect = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer.id
    }));
  };

  const handleRefreshCustomers = async () => {
    setIsRefreshingCustomers(true);
    try {
      await refreshCustomers();
    } catch (error) {
      console.error('Error refreshing customers:', error);
    } finally {
      setIsRefreshingCustomers(false);
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
      {/* Enhanced Customer Selection */}
      <div className="relative">
        <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
          Select Customer *
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => {
                  setCustomerSearchQuery(e.target.value);
                  setIsCustomerDropdownOpen(true);
                }}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                placeholder={isLoadingCustomers ? "Loading customers..." : `Search ${customers.length} customers by name, plot, phone, or project...`}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transform transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {/* Customer Dropdown */}
            {isCustomerDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isLoadingCustomers ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <RefreshCw size={16} className="animate-spin mr-2" />
                      Loading customers...
                    </div>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {customerSearchQuery ? 'No customers found matching your search' : 'No customers available'}
                  </div>
                ) : (
                  <>
                    <div className="p-2 border-b border-gray-100 bg-gray-50 text-xs text-gray-600">
                      {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
                    </div>
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 flex items-center">
                              <Users size={14} className="mr-2 text-blue-600" />
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <div className="flex items-center">
                                <Building2 size={12} className="mr-1" />
                                Plot #{customer.plotNumber} • {getProjectName(customer.projectId)}
                              </div>
                              {customer.phone && (
                                <div className="text-xs text-gray-500 mt-1">
                                  📞 {customer.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(customer.salePrice + customer.constructionPrice)}
                            </div>
                            <div className="text-xs text-gray-500">Total Value</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshCustomers}
            disabled={isRefreshingCustomers || isLoadingCustomers}
            className={`px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center ${isRefreshingCustomers || isLoadingCustomers ? 'animate-spin' : ''}`}
            title="Refresh customer list"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Selected Customer Info */}
        {formData.customerId && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-900">✓ Customer Selected</div>
                <div className="text-sm text-blue-700">
                  {formData.customerName} - Plot #{formData.plotNumber}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, customerId: '', customerName: '', plotNumber: '', projectId: '', totalPrice: '', constructionCharges: '' }));
                  setCustomerSearchQuery('');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Change Customer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden input for form validation */}
      <input
        type="hidden"
        name="customerId"
        value={formData.customerId}
        required
      />

      {/* Close dropdown when clicking outside */}
      {isCustomerDropdownOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsCustomerDropdownOpen(false)}
        />
      )}

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