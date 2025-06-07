import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Landlord } from '../types';
import { ArrowLeft, User, DollarSign, Phone, Mail, MapPin, Calculator, Landmark } from 'lucide-react';

interface LandlordFormProps {
  landlordId?: string | null;
  onComplete: () => void;
}

const LandlordForm: React.FC<LandlordFormProps> = ({ landlordId, onComplete }) => {
  const { addLandlord, updateLandlord, getLandlordById } = useExpenses();
  const [formData, setFormData] = useState<Omit<Landlord, 'id' | 'createdAt' | 'totalLandPrice'>>({
    name: '',
    amount: 0,
    pricePerAcre: 0,
    totalExtent: 0,
    phone: '',
    email: '',
    address: '',
    status: 'active'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calculate total land price
  const totalLandPrice = formData.pricePerAcre * formData.totalExtent;
  
  useEffect(() => {
    const fetchLandlord = async () => {
      if (landlordId) {
        const landlord = await getLandlordById(landlordId);
        if (landlord) {
          setFormData({
            name: landlord.name,
            amount: landlord.amount,
            pricePerAcre: landlord.pricePerAcre,
            totalExtent: landlord.totalExtent,
            phone: landlord.phone || '',
            email: landlord.email || '',
            address: landlord.address || '',
            status: landlord.status
          });
        }
      }
    };
    
    fetchLandlord();
  }, [landlordId, getLandlordById]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.amount < 0) {
      newErrors.amount = 'Amount cannot be negative';
    }
    
    if (formData.pricePerAcre < 0) {
      newErrors.pricePerAcre = 'Price per acre cannot be negative';
    }
    
    if (formData.totalExtent < 0) {
      newErrors.totalExtent = 'Total extent cannot be negative';
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Invalid phone number format (10 digits required)';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (landlordId) {
        await updateLandlord(landlordId, formData);
      } else {
        await addLandlord(formData);
      }
      
      // Only redirect to listing page if save is successful
      onComplete();
    } catch (error) {
      console.error('Error saving landlord:', error);
      // You could add error state handling here if needed
      // For example, display an error message to the user
    }
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: ['amount', 'pricePerAcre', 'totalExtent'].includes(name) 
        ? (value === '' ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value)))
        : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
          {landlordId ? 'Edit Landlord' : 'Add New Landlord'}
        </h1>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landlord Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter landlord name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Amount (Advance/Initial) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advance Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter advance amount"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Land Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Land Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Per Acre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Acre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    name="pricePerAcre"
                    value={formData.pricePerAcre}
                    onChange={handleChange}
                    min="0"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.pricePerAcre ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter price per acre"
                  />
                </div>
                {errors.pricePerAcre && (
                  <p className="mt-1 text-sm text-red-500">{errors.pricePerAcre}</p>
                )}
              </div>

              {/* Total Extent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Extent (Acres)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Landmark size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="totalExtent"
                    value={formData.totalExtent}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.totalExtent ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter total acres"
                  />
                </div>
                {errors.totalExtent && (
                  <p className="mt-1 text-sm text-red-500">{errors.totalExtent}</p>
                )}
              </div>
            </div>

            {/* Total Land Price (Auto-calculated) */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Land Price (Auto-calculated)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calculator size={18} className="text-blue-600" />
                </div>
                <input
                  type="text"
                  value={formatCurrency(totalLandPrice)}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 font-medium"
                  placeholder="Auto-calculated"
                />
              </div>
              <p className="mt-1 text-sm text-blue-600">
                Calculated as: Price per Acre × Total Extent = ₹{formData?.pricePerAcre?.toLocaleString('en-IN')} × {formData.totalExtent} acres
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              {landlordId ? 'Update Landlord' : 'Add Landlord'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandlordForm;
