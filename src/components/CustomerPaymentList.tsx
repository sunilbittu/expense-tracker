import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CustomerPayment, PaymentCategory } from '../types';
import usePrintAndExport from '../hooks/usePrintAndExport';
import { 
  Edit, 
  Trash2, 
  Search, 
  Receipt, 
  Building2, 
  Users, 
  Calendar,
  CreditCard,
  IndianRupee,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  Printer,
  Download
} from 'lucide-react';

interface CustomerPaymentListProps {
  onEditPayment: (paymentId: string) => void;
  onAddPayment: () => void;
}

const CustomerPaymentList: React.FC<CustomerPaymentListProps> = ({ onEditPayment, onAddPayment }) => {
  const { customerPayments, customers, projects, deleteCustomerPayment } = useExpenses();
  const { handlePrint, exportToPDF, formatCurrency: formatCurrencyUtil } = usePrintAndExport();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPaymentCategory, setSelectedPaymentCategory] = useState<PaymentCategory | ''>('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customerName' | 'createdAt'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Payment categories
  const paymentCategories = [
    { id: 'token', name: 'Token Amount' },
    { id: 'advance', name: 'Advance Payment' },
    { id: 'booking', name: 'Booking Payment' },
    { id: 'construction', name: 'Construction Payment' },
    { id: 'development', name: 'Development Charges' },
    { id: 'clubhouse', name: 'Clubhouse Charges' },
    { id: 'final', name: 'Final Payment' },
  ];

  // Payment modes
  const paymentModes = [
    { id: 'cash', name: 'Cash' },
    { id: 'online', name: 'Online Transfer' },
    { id: 'cheque', name: 'Cheque' },
  ];

  // Filtered and sorted payments
  const filteredPayments = useMemo(() => {
    let filtered = customerPayments.filter(payment => {
      const customer = customers.find(c => c.name === payment.customerName);
      
      const matchesSearch = payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.plotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProject = !selectedProject || payment.projectId === selectedProject;
      const matchesCategory = !selectedPaymentCategory || payment.paymentCategory === selectedPaymentCategory;
      const matchesMode = !selectedPaymentMode || payment.paymentMode === selectedPaymentMode;
      
      return matchesSearch && matchesProject && matchesCategory && matchesMode;
    });

    // Sort payments
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [customerPayments, customers, searchQuery, selectedProject, selectedPaymentCategory, selectedPaymentMode, sortBy, sortOrder]);

  const handleSort = (field: 'date' | 'amount' | 'customerName' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDeletePayment = (payment: CustomerPayment) => {
    if (window.confirm(`Are you sure you want to delete this payment of ${formatCurrency(payment.amount)} from ${payment.customerName}? This action cannot be undone.`)) {
      deleteCustomerPayment(payment.id);
    }
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case 'cash':
        return <IndianRupee size={16} className="text-green-600" />;
      case 'online':
        return <CreditCard size={16} className="text-blue-600" />;
      case 'cheque':
        return <FileText size={16} className="text-orange-600" />;
      default:
        return <Receipt size={16} className="text-gray-600" />;
    }
  };

  const getPaymentCategoryBadge = (category: PaymentCategory) => {
    const categoryData = paymentCategories.find(c => c.id === category);
    const colors = {
      'token': 'bg-yellow-100 text-yellow-800',
      'advance': 'bg-blue-100 text-blue-800',
      'booking': 'bg-green-100 text-green-800',
      'construction': 'bg-orange-100 text-orange-800',
      'development': 'bg-purple-100 text-purple-800',
      'clubhouse': 'bg-pink-100 text-pink-800',
      'final': 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
        {categoryData?.name || category}
      </span>
    );
  };

  // Calculate summary statistics
  const totalPayments = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paymentsThisMonth = filteredPayments.filter(payment => {
    const paymentDate = new Date(payment.date);
    const now = new Date();
    return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
  }).reduce((sum, payment) => sum + payment.amount, 0);

  const handleExportPDF = () => {
    const columns = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Customer Name', dataKey: 'customerName' },
      { header: 'Plot Number', dataKey: 'plotNumber' },
      { header: 'Amount', dataKey: 'amount' },
      { header: 'Payment Category', dataKey: 'paymentCategoryName' },
      { header: 'Payment Mode', dataKey: 'paymentMode' },
      { header: 'Project', dataKey: 'projectName' },
      { header: 'Description', dataKey: 'description' },
      { header: 'Invoice Number', dataKey: 'invoiceNumber' },
    ];

    const exportData = filteredPayments.map(payment => {
      const project = projects.find(p => p.id === payment.projectId);
      const categoryData = paymentCategories.find(c => c.id === payment.paymentCategory);
      return {
        ...payment,
        projectName: project?.name || 'Unknown Project',
        paymentCategoryName: categoryData?.name || payment.paymentCategory,
      };
    });

    exportToPDF({
      title: 'Customer Payments Report',
      filename: 'customer_payments',
      data: exportData,
      columns,
    });
  };

  return (
    <div className="space-y-6" id="payment-list-container">
      <div className="print-header" style={{ display: 'none' }}>
        <h1>Customer Payments Report</h1>
        <p>Generated on {new Date().toLocaleDateString('en-IN')}</p>
        <div className="print-stats">
          <div className="stat-item">
            <div className="stat-value">{filteredPayments.length}</div>
            <div className="stat-label">Total Payments</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(totalPayments)}</div>
            <div className="stat-label">Total Amount</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(paymentsThisMonth)}</div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(filteredPayments.length > 0 ? totalPayments / filteredPayments.length : 0)}</div>
            <div className="stat-label">Average Payment</div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Receipt className="mr-3 text-green-600" size={28} />
            Customer Payments
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage all customer payments and transactions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handlePrint('payment-list-container')}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer size={20} className="mr-2" />
            Print
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={20} className="mr-2" />
            Export PDF
          </button>
          <button
            onClick={onAddPayment}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Payment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Project Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 size={18} className="text-gray-400" />
            </div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Category Filter */}
          <select
            value={selectedPaymentCategory}
            onChange={(e) => setSelectedPaymentCategory(e.target.value as PaymentCategory | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Categories</option>
            {paymentCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Payment Mode Filter */}
          <select
            value={selectedPaymentMode}
            onChange={(e) => setSelectedPaymentMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Payment Modes</option>
            {paymentModes.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="customerName">Sort by Customer</option>
              <option value="createdAt">Sort by Created</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
            </div>
            <Receipt className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalPayments)}
              </p>
            </div>
            <IndianRupee className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(paymentsThisMonth)}
              </p>
            </div>
            <Calendar className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Payment</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredPayments.length > 0 ? totalPayments / filteredPayments.length : 0)}
              </p>
            </div>
            <CheckCircle className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedProject || selectedPaymentCategory || selectedPaymentMode
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by recording your first customer payment.'}
            </p>
            {!searchQuery && !selectedProject && !selectedPaymentCategory && !selectedPaymentMode && (
              <button
                onClick={onAddPayment}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add First Payment
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
                    onClick={() => handleSort('date')}
                  >
                    Payment Details {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('customerName')}
                  >
                    Customer & Plot {sortBy === 'customerName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    Amount & Category {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project & Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => {
                  const project = projects.find(p => p.id === payment.projectId);
                  const customer = customers.find(c => c.name === payment.customerName);

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Receipt size={20} className="text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(payment.date)}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock size={12} className="mr-1" />
                              Added {formatDate(payment.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 flex items-center">
                            <Users size={12} className="mr-1" />
                            {payment.customerName}
                          </div>
                          <div className="text-gray-500 flex items-center">
                            <Building2 size={12} className="mr-1" />
                            Plot #{payment.plotNumber}
                          </div>
                          {payment.invoiceNumber && (
                            <div className="text-xs text-gray-400">
                              Invoice: {payment.invoiceNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="mt-1">
                            {getPaymentCategoryBadge(payment.paymentCategory)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center mb-1">
                            {getPaymentModeIcon(payment.paymentMode)}
                            <span className="ml-2 capitalize">{payment.paymentMode}</span>
                          </div>
                          {payment.chequeNumber && (
                            <div className="text-xs text-gray-500">
                              Cheque: {payment.chequeNumber}
                            </div>
                          )}
                          {payment.transactionId && (
                            <div className="text-xs text-gray-500">
                              Txn: {payment.transactionId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 flex items-center">
                            <Building2 size={12} className="mr-1" />
                            {project?.name || 'Unknown Project'}
                          </div>
                          {payment.description && (
                            <div className="text-gray-500 text-xs mt-1 max-w-xs truncate">
                              {payment.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onEditPayment(payment.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit Payment"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Payment"
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
      </div>
    </div>
  );
};

export default CustomerPaymentList; 