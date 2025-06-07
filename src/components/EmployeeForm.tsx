import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Employee } from '../types';
import { ArrowLeft, Users, Briefcase, Phone, Mail, MapPin, Calendar } from 'lucide-react';

interface EmployeeFormProps {
  employeeId?: string | null;
  onComplete: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employeeId, onComplete }) => {
  const { addEmployee, updateEmployee, getEmployeeById } = useExpenses();
  
  const [formData, setFormData] = useState<Omit<Employee, 'id' | 'createdAt'>>({
    employeeId: '',
    name: '',
    jobTitle: '',
    salary: 0,
    phone: '',
    email: '',
    address: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (employeeId) {
      const employee = getEmployeeById(employeeId);
      if (employee) {
        setFormData({
          employeeId: employee.employeeId,
          name: employee.name,
          jobTitle: employee.jobTitle,
          salary: employee.salary,
          phone: employee.phone,
          email: employee.email || '',
          address: employee.address,
          joiningDate: employee.joiningDate,
          status: employee.status
        });
      }
    }
  }, [employeeId, getEmployeeById]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    
    if (formData.salary <= 0) {
      newErrors.salary = 'Salary must be greater than zero';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (employeeId) {
      updateEmployee(employeeId, formData);
    } else {
      addEmployee(formData);
    }
    
    onComplete();
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? parseFloat(value) || 0 : value
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
          {employeeId ? 'Edit Employee' : 'Add New Employee'}
        </h1>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.employeeId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter employee ID"
              />
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-500">{errors.employeeId}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.jobTitle ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter job title"
                />
              </div>
              {errors.jobTitle && (
                <p className="mt-1 text-sm text-red-500">{errors.jobTitle}</p>
              )}
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  min="0"
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.salary ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter salary"
                />
              </div>
              {errors.salary && (
                <p className="mt-1 text-sm text-red-500">{errors.salary}</p>
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

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              
              </div>
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
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter address"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
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
              {employeeId ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;