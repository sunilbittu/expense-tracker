import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Income, PaymentMode } from '../types';
import usePrintAndExport from '../hooks/usePrintAndExport';
import { 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  User,
  FileText,
  CreditCard,
  IndianRupee,
  Plus,
  Building2,
  Clock,
  CheckCircle,
  Printer,
  Download
} from 'lucide-react';

interface IncomeListProps {
  onEditIncome: (incomeId: string) => void;
  onAddIncome: () => void;
}

const IncomeList: React.FC<IncomeListProps> = ({ onEditIncome, onAddIncome }) => {
  const { incomes, deleteIncome } = useExpenses();
  const { handlePrint, exportToPDF, formatCurrency: formatCurrencyUtil } = usePrintAndExport();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode | ''>('');
  const [selectedSource, setSelectedSource] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'source' | 'payee' | 'createdAt'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

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

  // Payment modes
  const paymentModes = [
    { id: 'cash', name: 'Cash', icon: <DollarSign size={16} className="text-green-600" /> },
    { id: 'online', name: 'Online Transfer', icon: <CreditCard size={16} className="text-blue-600" /> },
    { id: 'cheque', name: 'Cheque', icon: <FileText size={16} className="text-orange-600" /> },
  ];

  // Get unique sources for filtering
  const uniqueSources = useMemo(() => {
    const sources = [...new Set(incomes.map(income => income.source))];
    return sources.filter(source => source && source.trim() !== '');
  }, [incomes]);

  // Filtered and sorted incomes
  const filteredIncomes = useMemo(() => {
    let filtered = incomes.filter(income => {
      const matchesSearch = income.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           income.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           income.payee.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPaymentMode = !selectedPaymentMode || income.paymentMode === selectedPaymentMode;
      const matchesSource = !selectedSource || income.source === selectedSource;
      
      const matchesDateRange = (!dateFilter.startDate || income.date >= dateFilter.startDate) &&
                              (!dateFilter.endDate || income.date <= dateFilter.endDate);
      
      return matchesSearch && matchesPaymentMode && matchesSource && matchesDateRange;
    });

    // Sort incomes
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
        case 'source':
          aValue = a.source.toLowerCase();
          bValue = b.source.toLowerCase();
          break;
        case 'payee':
          aValue = a.payee.toLowerCase();
          bValue = b.payee.toLowerCase();
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
  }, [incomes, searchQuery, selectedPaymentMode, selectedSource, dateFilter, sortBy, sortOrder]);

  const handleSort = (field: 'date' | 'amount' | 'source' | 'payee' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteIncome = (income: Income) => {
    if (window.confirm(`Are you sure you want to delete this income entry of ${formatCurrency(income.amount)} from ${income.source}? This action cannot be undone.`)) {
      deleteIncome(income.id);
    }
  };

  const getPaymentModeIcon = (mode: PaymentMode) => {
    const modeData = paymentModes.find(m => m.id === mode);
    return modeData?.icon || <FileText size={16} className="text-gray-600" />;
  };

  // Calculate summary statistics
  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  const incomeThisMonth = filteredIncomes.filter(income => {
    const incomeDate = new Date(income.date);
    const now = new Date();
    return incomeDate.getMonth() === now.getMonth() && incomeDate.getFullYear() === now.getFullYear();
  }).reduce((sum, income) => sum + income.amount, 0);

  const averageIncome = filteredIncomes.length > 0 ? totalIncome / filteredIncomes.length : 0;

  // Group by payment mode for stats
  const paymentModeStats = useMemo(() => {
    const stats = {};
    filteredIncomes.forEach(income => {
      stats[income.paymentMode] = (stats[income.paymentMode] || 0) + income.amount;
    });
    return stats;
  }, [filteredIncomes]);

  const handleExportPDF = () => {
    const columns = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Amount', dataKey: 'amount' },
      { header: 'Source', dataKey: 'source' },
      { header: 'Payee', dataKey: 'payee' },
      { header: 'Payment Mode', dataKey: 'paymentMode' },
      { header: 'Description', dataKey: 'description' },
      { header: 'Cheque Number', dataKey: 'chequeNumber' },
      { header: 'Transaction ID', dataKey: 'transactionId' },
    ];

    exportToPDF({
      title: 'Income Report',
      filename: 'income',
      data: filteredIncomes,
      columns,
    });
  };

  return (
    <div className="space-y-6" id="income-list-container">
      <div className="print-header" style={{ display: 'none' }}>
        <h1>Income Report</h1>
        <p>Generated on {new Date().toLocaleDateString('en-IN')}</p>
        <div className="print-stats">
          <div className="stat-item">
            <div className="stat-value">{filteredIncomes.length}</div>
            <div className="stat-label">Total Entries</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(totalIncome)}</div>
            <div className="stat-label">Total Income</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(incomeThisMonth)}</div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(averageIncome)}</div>
            <div className="stat-label">Average Amount</div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="mr-3 text-green-600" size={28} />
            Income Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage all income sources and payments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handlePrint('income-list-container')}
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
            onClick={onAddIncome}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Income
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search income entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          {/* Payment Mode Filter */}
          <select
            value={selectedPaymentMode}
            onChange={(e) => setSelectedPaymentMode(e.target.value as PaymentMode | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Payment Modes</option>
            {paymentModes.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <input
            type="date"
            placeholder="Start Date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />

          <input
            type="date"
            placeholder="End Date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 mt-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="source">Sort by Source</option>
            <option value="payee">Sort by Payee</option>
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

      {/* Income Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{filteredIncomes.length}</p>
            </div>
            <FileText className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalIncome)}
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
                {formatCurrency(incomeThisMonth)}
              </p>
            </div>
            <Calendar className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(averageIncome)}
              </p>
            </div>
            <CheckCircle className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredIncomes.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No income entries found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedPaymentMode || selectedSource || dateFilter.startDate || dateFilter.endDate
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by recording your first income entry.'}
            </p>
            {!searchQuery && !selectedPaymentMode && !selectedSource && !dateFilter.startDate && !dateFilter.endDate && (
              <button
                onClick={onAddIncome}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add First Income
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
                    Date & Time {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('source')}
                  >
                    Source {sortBy === 'source' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('payee')}
                  >
                    Payee {sortBy === 'payee' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncomes.map((income) => (
                  <tr key={income.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <TrendingUp size={20} className="text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(income.date)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock size={12} className="mr-1" />
                            Added {formatDate(income.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(income.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <Building2 size={12} className="mr-1" />
                        {income.source}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <User size={12} className="mr-1" />
                        {income.payee}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPaymentModeIcon(income.paymentMode)}
                        <span className="ml-2 text-sm capitalize">{income.paymentMode}</span>
                      </div>
                      {income.chequeNumber && (
                        <div className="text-xs text-gray-500 mt-1">
                          Cheque: {income.chequeNumber}
                        </div>
                      )}
                      {income.transactionId && (
                        <div className="text-xs text-gray-500 mt-1">
                          Txn: {income.transactionId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {income.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEditIncome(income.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit Income"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(income)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Income"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeList; 