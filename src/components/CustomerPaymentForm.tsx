import React, { useState, useEffect, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { PaymentCategory } from '../types';
import { ArrowLeft, Building2, Users, Receipt, Search, RefreshCw, ChevronDown, Wallet, CreditCard, FileCheck } from 'lucide-react';

interface CustomerPaymentFormProps {
  paymentId?: string | null;
  onComplete: () => void;
}

const CustomerPaymentForm: React.FC<CustomerPaymentFormProps> = ({ paymentId, onComplete }) => {
  const { addCustomerPayment, updateCustomerPayment, customers, projects, refreshCustomers, isLoadingCustomers, customerPayments } = useExpenses();
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    amount: '',
    paymentDate: '',
    paymentMethod: 'credit_card',
    plotNumber: '',
    description: 'Customer payment',
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
      projects.find(p => p._id === customer.projectId)?.name.toLowerCase().includes(query)
    );
  }, [customers, customerSearchQuery, projects]);

  // Auto-fill customer details when a customer is selected
  useEffect(() => {
    if (formData.customerId) {
      const selectedCustomer = customers.find(c => c.id === formData.customerId);
      if (selectedCustomer) {
        console.log('Selected customer:', selectedCustomer);
        console.log('Customer projectId:', selectedCustomer.projectId);
        console.log('Available projects:', projects);
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
  }, [formData.customerId, customers, projects]);

  useEffect(() => {
    if (paymentId) {
      const payment = customerPayments.find(p => p.id === paymentId);
      if (payment) {
        // Find customer by name since CustomerPayment doesn't have customerId
        const customer = customers.find(c => c.name === payment.customerName);
        setFormData(prev => ({
          ...prev,
          customerId: customer?.id || '',
          customerName: payment.customerName || '',
          amount: payment.amount.toString(),
          paymentDate: payment.date,
          paymentMethod: payment.paymentMode || 'cash',
          plotNumber: payment.plotNumber || '',
          description: payment.description || 'Customer payment',
          paymentCategory: payment.paymentCategory || 'token',
          totalPrice: payment.totalPrice?.toString() || '',
          developmentCharges: payment.developmentCharges?.toString() || '',
          clubhouseCharges: payment.clubhouseCharges?.toString() || '',
          constructionCharges: payment.constructionCharges?.toString() || '',
          projectId: payment.projectId || '',
        }));
        // Set the search query to show the customer name
        if (customer) {
          setCustomerSearchQuery(customer.name);
        }
      }
    }
  }, [paymentId, customerPayments, customers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentData = {
      amount: parseFloat(formData.amount),
      date: formData.paymentDate,
      description: formData.description || 'Customer payment',
      paymentMode: formData.paymentMethod as any,
      customerName: formData.customerName,
      projectId: formData.projectId,
      plotNumber: formData.plotNumber,
      paymentCategory: formData.paymentCategory,
      totalPrice: parseFloat(formData.totalPrice),
      developmentCharges: parseFloat(formData.developmentCharges),
      clubhouseCharges: parseFloat(formData.clubhouseCharges),
      constructionCharges: parseFloat(formData.constructionCharges),
    };

    try {
      if (paymentId) {
        // Update existing payment
        await updateCustomerPayment(paymentId, paymentData);
      } else {
        // Add new payment
        await addCustomerPayment(paymentData);
        // Reset form only for new payments
        setFormData({
          customerId: '',
          customerName: '',
          amount: '',
          paymentDate: '',
          paymentMethod: 'credit_card',
          plotNumber: '',
          description: 'Customer payment',
          paymentCategory: 'token',
          totalPrice: '',
          developmentCharges: '',
          clubhouseCharges: '',
          constructionCharges: '',
          projectId: '',
        });
        setCustomerSearchQuery('');
      }
      
      // Redirect to customer payment list after successful submission
      onComplete();
    } catch (error) {
      console.error('Error submitting customer payment:', error);
      // Error is already handled in the context with toast
    }
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
    const project = projects.find(p => p._id === projectId);
    return project?.name || 'Unknown Project';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const paymentMethods = [
    { id: 'credit_card', name: 'Credit Card', icon: CreditCard },
    { id: 'debit_card', name: 'Debit Card', icon: CreditCard },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: FileCheck },
    { id: 'cash', name: 'Cash', icon: Wallet },
  ];

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
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className={`px-3 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center ${isRefreshingCustomers || isLoadingCustomers ? 'animate-spin' : ''}`}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project */}
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                Project {formData.projectId && <span className="text-xs text-gray-500">(Auto-selected: {getProjectName(formData.projectId)})</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={18} className="text-gray-400" />
                </div>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                  disabled={!!formData.customerId}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                    formData.customerId 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Debug info */}
              {formData.projectId && (
                <div className="mt-1 text-xs text-gray-500">
                  Debug - Form projectId: {formData.projectId}
                </div>
              )}
            </div>

            {/* Plot Number */}
            <div>
              <label htmlFor="plotNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Plot Number
              </label>
              <input
                type="text"
                id="plotNumber"
                name="plotNumber"
                value={formData.plotNumber}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Payment Category */}
            <div>
              <label htmlFor="paymentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Category
              </label>
              <select
                id="paymentCategory"
                name="paymentCategory"
                value={formData.paymentCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {paymentCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Price */}
            <div>
              <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Total Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  id="totalPrice"
                  name="totalPrice"
                  value={formData.totalPrice}
                  disabled
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount {paymentId && <span className="text-xs text-gray-500">(Fixed)</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  disabled={!!paymentId}
                  className={`w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg ${
                    paymentId 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Development Charges */}
            <div>
              <label htmlFor="developmentCharges" className="block text-sm font-medium text-gray-700 mb-1">
                Development Charges
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  id="developmentCharges"
                  name="developmentCharges"
                  value={formData.developmentCharges}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Clubhouse Charges */}
            <div>
              <label htmlFor="clubhouseCharges" className="block text-sm font-medium text-gray-700 mb-1">
                Clubhouse Charges
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  id="clubhouseCharges"
                  name="clubhouseCharges"
                  value={formData.clubhouseCharges}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Construction Charges */}
            <div>
              <label htmlFor="constructionCharges" className="block text-sm font-medium text-gray-700 mb-1">
                Construction Charges
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  id="constructionCharges"
                  name="constructionCharges"
                  value={formData.constructionCharges}
                  disabled
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                id="paymentDate"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {paymentMethods.map(({ id, name, icon: Icon }) => (
                <div
                  key={id}
                  onClick={() => handleChange({ target: { name: 'paymentMethod', value: id } } as any)}
                  className={`cursor-pointer flex items-center p-3 rounded-lg transition-colors ${
                    formData.paymentMethod === id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className={`${formData.paymentMethod === id ? 'text-blue-600' : 'text-gray-600'} mr-2`} />
                  <span className={`text-sm ${formData.paymentMethod === id ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <Receipt size={18} className="text-gray-400" />
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter payment description..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
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