import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Expense, PaymentMode } from '../types';
import usePrintAndExport from '../hooks/usePrintAndExport';
import { 
  Edit, 
  Trash2, 
  Search, 
  TrendingDown, 
  Calendar,
  Tag,
  FileText,
  CreditCard,
  IndianRupee,
  Plus,
  Building2,
  Clock,
  BarChart3,
  Layers,
  Printer,
  Download
} from 'lucide-react';

interface ExpenseListProps {
  onEditExpense: (expenseId: string) => void;
  onAddExpense: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ onEditExpense, onAddExpense }) => {
  const { expenses, projects, categories, deleteExpense } = useExpenses();
  const { handlePrint, exportToPDF, formatCurrency: formatCurrencyUtil } = usePrintAndExport();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode | ''>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category' | 'project' | 'createdAt'>('date');
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
    { id: 'cash', name: 'Cash', icon: <IndianRupee size={16} className="text-green-600" /> },
    { id: 'online', name: 'Online Transfer', icon: <CreditCard size={16} className="text-blue-600" /> },
    { id: 'cheque', name: 'Cheque', icon: <FileText size={16} className="text-orange-600" /> },
  ];

  // Get subcategories for selected category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categories.find(c => c.id === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory, categories]);

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProject = !selectedProject || expense.projectId === selectedProject;
      const matchesCategory = !selectedCategory || expense.category === selectedCategory;
      const matchesSubcategory = !selectedSubcategory || expense.subcategory === selectedSubcategory;
      const matchesPaymentMode = !selectedPaymentMode || expense.paymentMode === selectedPaymentMode;
      
      const matchesDateRange = (!dateFilter.startDate || expense.date >= dateFilter.startDate) &&
                              (!dateFilter.endDate || expense.date <= dateFilter.endDate);
      
      return matchesSearch && matchesProject && matchesCategory && matchesSubcategory && matchesPaymentMode && matchesDateRange;
    });

    // Sort expenses
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
        case 'category':
          const aCat = categories.find(c => c.id === a.category);
          const bCat = categories.find(c => c.id === b.category);
          aValue = aCat?.name.toLowerCase() || '';
          bValue = bCat?.name.toLowerCase() || '';
          break;
        case 'project':
          const aProj = projects.find(p => p.id === a.projectId);
          const bProj = projects.find(p => p.id === b.projectId);
          aValue = aProj?.name.toLowerCase() || '';
          bValue = bProj?.name.toLowerCase() || '';
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
  }, [expenses, searchQuery, selectedProject, selectedCategory, selectedSubcategory, selectedPaymentMode, dateFilter, sortBy, sortOrder, categories, projects]);

  const handleSort = (field: 'date' | 'amount' | 'category' | 'project' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteExpense = (expense: Expense) => {
    const category = categories.find(c => c.id === expense.category);
    const categoryName = category?.name || 'Unknown';
    if (window.confirm(`Are you sure you want to delete this ${categoryName} expense of ${formatCurrency(expense.amount)}? This action cannot be undone.`)) {
      deleteExpense(expense.id);
    }
  };

  const getPaymentModeIcon = (mode: PaymentMode) => {
    const modeData = paymentModes.find(m => m.id === mode);
    return modeData?.icon || <FileText size={16} className="text-gray-600" />;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const subcategory = category?.subcategories.find(s => s.id === subcategoryId);
    return subcategory?.name || 'Unknown Subcategory';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  // Calculate summary statistics
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesThisMonth = filteredExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  }).reduce((sum, expense) => sum + expense.amount, 0);

  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

  // Group by category for stats
  const categoryStats = useMemo(() => {
    const stats = {};
    filteredExpenses.forEach(expense => {
      const categoryName = getCategoryName(expense.category);
      stats[categoryName] = (stats[categoryName] || 0) + expense.amount;
    });
    return stats;
  }, [filteredExpenses, categories]);

  // Group by project for stats
  const projectStats = useMemo(() => {
    const stats = {};
    filteredExpenses.forEach(expense => {
      const projectName = getProjectName(expense.projectId);
      stats[projectName] = (stats[projectName] || 0) + expense.amount;
    });
    return stats;
  }, [filteredExpenses, projects]);

  // Reset subcategory when category changes
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Amount', dataKey: 'amount' },
      { header: 'Category', dataKey: 'categoryName' },
      { header: 'Subcategory', dataKey: 'subcategoryName' },
      { header: 'Project', dataKey: 'projectName' },
      { header: 'Payment Mode', dataKey: 'paymentMode' },
      { header: 'Description', dataKey: 'description' },
      { header: 'Cheque Number', dataKey: 'chequeNumber' },
      { header: 'Transaction ID', dataKey: 'transactionId' },
    ];

    const exportData = filteredExpenses.map(expense => ({
      ...expense,
      categoryName: getCategoryName(expense.category),
      subcategoryName: getSubcategoryName(expense.category, expense.subcategory),
      projectName: getProjectName(expense.projectId),
    }));

    exportToPDF({
      title: 'Expense Report',
      filename: 'expenses',
      data: exportData,
      columns,
    });
  };

  return (
    <div className="space-y-6" id="expense-list-container">
      <div className="print-header" style={{ display: 'none' }}>
        <h1>Expense Report</h1>
        <p>Generated on {new Date().toLocaleDateString('en-IN')}</p>
        <div className="print-stats">
          <div className="stat-item">
            <div className="stat-value">{filteredExpenses.length}</div>
            <div className="stat-label">Total Expenses</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(totalExpenses)}</div>
            <div className="stat-label">Total Amount</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(expensesThisMonth)}</div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(averageExpense)}</div>
            <div className="stat-label">Average Amount</div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <TrendingDown className="mr-3 text-red-600" size={28} />
            Expense Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage all business expenses across projects and categories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handlePrint('expense-list-container')}
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
            onClick={onAddExpense}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Date Range */}
          <input
            type="date"
            placeholder="Start Date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />

          <input
            type="date"
            placeholder="End Date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Project Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 size={18} className="text-gray-400" />
            </div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Subcategory Filter */}
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={!selectedCategory}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">All Subcategories</option>
            {availableSubcategories.map(subcategory => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>

          {/* Payment Mode Filter */}
          <select
            value={selectedPaymentMode}
            onChange={(e) => setSelectedPaymentMode(e.target.value as PaymentMode | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Payment Modes</option>
            {paymentModes.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>

          {/* Sort Options */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="category">Sort by Category</option>
              <option value="project">Sort by Project</option>
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

      {/* Expense Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
            </div>
            <FileText className="text-red-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <IndianRupee className="text-red-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(expensesThisMonth)}
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
                {formatCurrency(averageExpense)}
              </p>
            </div>
            <BarChart3 className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedProject || selectedCategory || selectedPaymentMode || dateFilter.startDate || dateFilter.endDate
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by recording your first expense.'}
            </p>
            {!searchQuery && !selectedProject && !selectedCategory && !selectedPaymentMode && !dateFilter.startDate && !dateFilter.endDate && (
              <button
                onClick={onAddExpense}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add First Expense
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
                    onClick={() => handleSort('category')}
                  >
                    Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('project')}
                  >
                    Project {sortBy === 'project' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <TrendingDown size={20} className="text-red-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(expense.date)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock size={12} className="mr-1" />
                            Added {formatDate(expense.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-red-600">
                        -{formatCurrency(expense.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 flex items-center">
                          <Tag size={12} className="mr-1" />
                          {getCategoryName(expense.category)}
                        </div>
                        <div className="text-gray-500 flex items-center">
                          <Layers size={12} className="mr-1" />
                          {getSubcategoryName(expense.category, expense.subcategory)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <Building2 size={12} className="mr-1" />
                        {getProjectName(expense.projectId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPaymentModeIcon(expense.paymentMode)}
                        <span className="ml-2 text-sm capitalize">{expense.paymentMode}</span>
                      </div>
                      {expense.chequeNumber && (
                        <div className="text-xs text-gray-500 mt-1">
                          Cheque: {expense.chequeNumber}
                        </div>
                      )}
                      {expense.transactionId && (
                        <div className="text-xs text-gray-500 mt-1">
                          Txn: {expense.transactionId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {expense.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEditExpense(expense.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit Expense"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Expense"
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

export default ExpenseList; 