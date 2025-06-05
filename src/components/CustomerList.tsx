import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Customer } from '../types';
import usePrintAndExport from '../hooks/usePrintAndExport';
import { 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Home,
  Calculator,
  IndianRupee,
  Eye,
  Plus,
  Printer,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface CustomerListProps {
  onEditCustomer: (customerId: string) => void;
  onAddCustomer: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onEditCustomer, onAddCustomer }) => {
  const { customers, projects, deleteCustomer, customerPayments } = useExpenses();
  const { handlePrint, exportToPDF, formatCurrency: formatCurrencyUtil } = usePrintAndExport();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'plotNumber' | 'salePrice' | 'createdAt' | 'balance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'outstanding' | 'paid'>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate total payments for a customer
  const getCustomerTotalPayments = useCallback((customerName: string) => {
    return customerPayments
      .filter(payment => payment.customerName === customerName)
      .reduce((total, payment) => total + payment.amount, 0);
  }, [customerPayments]);

  // Calculate balance due for a customer
  const getCustomerBalance = useCallback((customer: Customer) => {
    const totalPrice = customer.salePrice + customer.constructionPrice;
    const totalPaid = getCustomerTotalPayments(customer.name);
    return totalPrice - totalPaid;
  }, [getCustomerTotalPayments]);

  // Enhanced filtering and sorting
  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      // Text search
      const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           customer.plotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           customer.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Project filter
      const matchesProject = !selectedProject || customer.projectId === selectedProject;
      
      // Balance filter
      const balance = getCustomerBalance(customer);
      const matchesBalance = balanceFilter === 'all' || 
                            (balanceFilter === 'outstanding' && balance > 0) ||
                            (balanceFilter === 'paid' && balance <= 0);
      
      // Amount range filter
      const totalValue = customer.salePrice + customer.constructionPrice;
      const matchesMinAmount = !minAmount || totalValue >= parseFloat(minAmount);
      const matchesMaxAmount = !maxAmount || totalValue <= parseFloat(maxAmount);
      
      return matchesSearch && matchesProject && matchesBalance && matchesMinAmount && matchesMaxAmount;
    });

    // Enhanced sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'plotNumber':
          aValue = a.plotNumber.toLowerCase();
          bValue = b.plotNumber.toLowerCase();
          break;
        case 'salePrice':
          aValue = a.salePrice + a.constructionPrice;
          bValue = b.salePrice + b.constructionPrice;
          break;
        case 'balance':
          aValue = getCustomerBalance(a);
          bValue = getCustomerBalance(b);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [customers, searchQuery, selectedProject, sortBy, sortOrder, balanceFilter, minAmount, maxAmount, getCustomerBalance]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedProject, balanceFilter, minAmount, maxAmount]);

  const handleSort = (field: 'name' | 'plotNumber' | 'salePrice' | 'createdAt' | 'balance') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`)) {
      try {
        await deleteCustomer(customer.id);
        setSelectedCustomers(prev => {
          const newSet = new Set(prev);
          newSet.delete(customer.id);
          return newSet;
        });
      } catch (error) {
        // Error is already handled in the context with toast
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCustomers.size === paginatedCustomers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(paginatedCustomers.map(c => c.id)));
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProject('');
    setBalanceFilter('all');
    setMinAmount('');
    setMaxAmount('');
    setShowAdvancedFilters(false);
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Customer Name', dataKey: 'name' },
      { header: 'Plot Number', dataKey: 'plotNumber' },
      { header: 'Plot Size (sq.yd)', dataKey: 'plotSize' },
      { header: 'Built-up Area (sq.ft)', dataKey: 'builtUpArea' },
      { header: 'Project', dataKey: 'projectName' },
      { header: 'Sale Price', dataKey: 'salePrice' },
      { header: 'Construction Price', dataKey: 'constructionPrice' },
      { header: 'Total Price', dataKey: 'totalPrice' },
      { header: 'Balance', dataKey: 'balance' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Email', dataKey: 'email' },
    ];

    const exportData = filteredCustomers.map(customer => {
      const project = projects.find(p => p.id === customer.projectId);
      return {
        ...customer,
        projectName: project?.name || 'Unknown Project',
        totalPrice: customer.salePrice + customer.constructionPrice,
        balance: getCustomerBalance(customer),
      };
    });

    exportToPDF({
      title: 'Customer Master List',
      filename: 'customers',
      data: exportData,
      columns,
    });
  };

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const totalValue = filteredCustomers.reduce((sum, c) => sum + c.salePrice + c.constructionPrice, 0);
    const totalPaid = filteredCustomers.reduce((sum, c) => sum + getCustomerTotalPayments(c.name), 0);
    const totalOutstanding = totalValue - totalPaid;
    const outstandingCustomers = filteredCustomers.filter(c => getCustomerBalance(c) > 0).length;

    return {
      totalCustomers: filteredCustomers.length,
      totalValue,
      totalPaid,
      totalOutstanding,
      outstandingCustomers
    };
  }, [filteredCustomers, getCustomerTotalPayments, getCustomerBalance]);

  return (
    <div className="space-y-6" id="customer-list-container">
      <div className="print-header" style={{ display: 'none' }}>
        <h1>Customer Master List</h1>
        <p>Generated on {new Date().toLocaleDateString('en-IN')}</p>
        <div className="print-stats">
          <div className="stat-item">
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(stats.totalValue)}</div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(stats.totalPaid)}</div>
            <div className="stat-label">Total Payments</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(stats.totalOutstanding)}</div>
            <div className="stat-label">Outstanding</div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="mr-3 text-blue-600" size={28} />
            Customer Master List
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({stats.totalCustomers} customers)
            </span>
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            Manage your customers and their property details
            <span className="ml-2 text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className={`flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => handlePrint('customer-list-container')}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer size={20} className="mr-2" />
            Print
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} className="mr-2" />
            Export PDF
          </button>
          <button
            onClick={onAddCustomer}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Project Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="plotNumber">Sort by Plot Number</option>
              <option value="salePrice">Sort by Total Value</option>
              <option value="createdAt">Sort by Date Added</option>
              <option value="balance">Sort by Balance</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Filter size={16} className="mr-1" />
            Advanced Filters {showAdvancedFilters ? '▲' : '▼'}
          </button>
          {(searchQuery || selectedProject || balanceFilter !== 'all' || minAmount || maxAmount) && (
            <button
              onClick={clearFilters}
              className="flex items-center text-red-600 hover:text-red-800 transition-colors"
            >
              <X size={16} className="mr-1" />
              Clear All Filters
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Balance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Customers</option>
                <option value="outstanding">Outstanding Balance</option>
                <option value="paid">Fully Paid</option>
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Total Value
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="Min amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Total Value
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="Max amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Items per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items per page
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
            <IndianRupee className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalPaid)}
              </p>
            </div>
            <Calculator className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalOutstanding)}
              </p>
            </div>
            <IndianRupee className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedProject 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first customer.'}
            </p>
            {!searchQuery && !selectedProject && (
              <button
                onClick={onAddCustomer}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add First Customer
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Customer Details {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('plotNumber')}
                  >
                    Plot Details {sortBy === 'plotNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('salePrice')}
                  >
                    Financial Details {sortBy === 'salePrice' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCustomers.map((customer) => {
                  const project = projects.find(p => p.id === customer.projectId);
                  const totalPaid = getCustomerTotalPayments(customer.name);
                  const balance = getCustomerBalance(customer);
                  const totalValue = customer.salePrice + customer.constructionPrice;
                  const paymentProgress = totalValue > 0 ? (totalPaid / totalValue) * 100 : 0;

                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users size={20} className="text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Building2 size={12} className="mr-1" />
                              {project?.name || 'Unknown Project'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">Plot #{customer.plotNumber}</div>
                          <div className="text-gray-500">
                            <div className="flex items-center">
                              <Home size={12} className="mr-1" />
                              {customer.plotSize} sq.yd | {customer.builtUpArea} sq.ft
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.phone && (
                            <div className="flex items-center mb-1">
                              <Phone size={12} className="mr-1 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center">
                              <Mail size={12} className="mr-1 text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                          {!customer.phone && !customer.email && (
                            <span className="text-gray-400">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{formatCurrency(totalValue)}</div>
                          <div className="text-xs text-gray-500">
                            Sale: {formatCurrency(customer.salePrice)} + 
                            Construction: {formatCurrency(customer.constructionPrice)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-green-600 font-medium">
                              {formatCurrency(totalPaid)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {paymentProgress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                paymentProgress >= 100 ? 'bg-green-500' : 
                                paymentProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Balance: {formatCurrency(balance)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onEditCustomer(customer.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit Customer"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Customer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredCustomers.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of{' '}
                {filteredCustomers.length} customers
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else {
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList; 