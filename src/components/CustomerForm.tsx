import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Customer } from '../types';
import { ArrowLeft, Users, Building2, Phone, Mail, MapPin } from 'lucide-react';

interface CustomerFormProps {
  customerId?: string | null;
  onComplete: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customerId, onComplete }) => {
  const { addCustomer, updateCustomer, getCustomerById, projects } = useExpenses();
  
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt'>>({
    name: '',
    plotNumber: '',
    plotSize: 0,
    projectId: projects[0]?.id || '',
    salePrice: 0,
    pricePerYard: 0,
    constructionPrice: 0,
    constructionPricePerSqft: 0,
    phone: '',
    email: '',
    address: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (customerId) {
      const customer = getCustomerById(customerId);
      if (customer) {
        setFormData({
          name: customer.name,
          plotNumber: customer.plotNumber,
          plotSize: customer.plotSize,
          projectId: customer.projectId,
          salePrice: customer.salePrice,
          pricePerYard: customer.pricePerYard,
          constructionPrice: customer.constructionPrice,
          constructionPricePerSqft: customer.constructionPricePerSqft,
          phone: customer.phone || '',
          email: customer.email || '',
          address: customer.address || '',
        });
      }
    }
  }, [customerId, getCustomerById]);

  // Auto-calculate sale price when plot size or price per yard changes
  useEffect(() => {
    if (formData.plotSize > 0 && formData.pricePerYard > 0) {
      const calculatedSalePrice = formData.plotSize * formData.pricePerYard;
      setFormData(prev => ({
        ...prev,
        salePrice: calculatedSalePrice
      }));
    }
  }, [formData.plotSize, formData.pricePerYard]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }
    
    if (!formData.plotNumber.trim()) {
      newErrors.plotNumber = 'Plot number is required';
    }

    if (formData.plotSize <= 0) {
      newErrors.plotSize = 'Plot size must be greater than zero';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    
    if (formData.pricePerYard <= 0) {
      newErrors.pricePerYard = 'Price per yard must be greater than zero';
    }
    
    if (formData.constructionPrice <= 0) {
      newErrors.constructionPrice = 'Construction price must be greater than zero';
    }
    
    if (formData.constructionPricePerSqft <= 0) {
      newErrors.constructionPricePerSqft = 'Construction price per sqft must be greater than zero';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (customerId) {
      updateCustomer(customerId, formData);
    } else {
      addCustomer(formData);
    }
    
    onComplete();
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Price') || name.includes('price') || name === 'plotSize'
        ? parseFloat(value) || 0
        : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
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
          {customerId ? 'Edit Customer' : 'Add New Customer'}
        </h1>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter customer name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={18} className="text-gray-400" />
                </div>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.projectId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-500">{errors.projectId}</p>
              )}
            </div>

            {/* Plot Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plot Number
              </label>
              <input
                type="text"
                name="plotNumber"
                value={formData.plotNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.plotNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter plot number"
              />
              {errors.plotNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.plotNumber}</p>
              )}
            </div>

            {/* Plot Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plot Size (sq yards)
              </label>
              <input
                type="number"
                name="plotSize"
                value={formData.plotSize}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.plotSize ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter plot size"
              />
              {errors.plotSize && (
                <p className="mt-1 text-sm text-red-500">{errors.plotSize}</p>
              )}
            </div>

            {/* Price Per Yard */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Per Yard
              </label>
              <input
                type="number"
                name="pricePerYard"
                value={formData.pricePerYard}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.pricePerYard ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter price per yard"
              />
              {errors.pricePerYard && (
                <p className="mt-1 text-sm text-red-500">{errors.pricePerYard}</p>
              )}
            </div>

            {/* Sale Price (Auto-calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price (Auto-calculated)
              </label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="Auto-calculated"
              />
            </div>

            {/* Construction Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Construction Price
              </label>
              <input
                type="number"
                name="constructionPrice"
                value={formData.constructionPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.constructionPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter construction price"
              />
              {errors.constructionPrice && (
                <p className="mt-1 text-sm text-red-500">{errors.constructionPrice}</p>
              )}
            </div>

            {/* Construction Price Per Sqft */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Construction Price Per Sqft
              </label>
              <input
                type="number"
                name="constructionPricePerSqft"
                value={formData.constructionPricePerSqft}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.constructionPricePerSqft ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter construction price per sqft"
              />
              {errors.constructionPricePerSqft && (
                <p className="mt-1 text-sm text-red-500">{errors.constructionPricePerSqft}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <MapPin size={18} className="text-gray-400" />
              </div>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter address"
              />
            </div>
          </div>

          {/* Submit Button */}
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
              {customerId ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;