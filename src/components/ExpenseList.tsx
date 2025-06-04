import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { FilterOptions } from '../types';
import { categoryIcons } from '../data/mockData';

interface ExpenseListProps {
  onEditExpense: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ onEditExpense }) => {
  const { expenses, deleteExpense, projects, categories } = useExpenses();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const itemsPerPage = 10;
  
  const [filters, setFilters] = useState<FilterOptions>({
    project: '',
    category: '',
    subcategory: '',
    startDate: '',
    endDate: '',
    searchQuery: '',
    paymentMode: undefined,
  });

  // Apply filters and search
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Project filter
      if (filters.project && expense.projectId !== filters.project) {
        return false;
      }
      
      // Category filter
      if (filters.category && expense.category !== filters.category) {
        return false;
      }

      // Subcategory filter
      if (filters.subcategory && expense.subcategory !== filters.subcategory) {
        return false;
      }
      
      // Date range filter
      if (filters.startDate && expense.date < filters.startDate) {
        return false;
      }
      
      if (filters.endDate && expense.date > filters.endDate) {
        return false;
      }

      // Payment mode filter
      if (filters.paymentMode && expense.paymentMode !== filters.paymentMode) {
        return false;
      }
      
      // Search query (case insensitive)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesDescription = expense.description.toLowerCase().includes(query);
        const matchesProject = projects.find(p => p.id === expense.projectId)?.name.toLowerCase().includes(query);
        const matchesCategory = categories.find(c => c.id === expense.category)?.name.toLowerCase().includes(query);
        
        if (!matchesDescription && !matchesProject && !matchesCategory) {
          return false;
        }
      }
      
      return true;
    });
  }, [expenses, filters, projects, categories]);
  
  // Sort expenses by date (newest first)
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredExpenses]);
  
  // Pagination
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const currentExpenses = sortedExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  const handleFilterChange = (name: keyof FilterOptions, value: string) => {
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const clearFilters = () => {
    setFilters({
      project: '',
      category: '',
      subcategory: '',
      startDate: '',
      endDate: '',
      searchQuery: '',
      paymentMode: undefined,
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
    }
  };
  
  // Get project and category names
  const getProjectName = (id: string) => {
    const project = projects.find((p) => p.id === id);
    return project ? project.name : 'Unknown Project';
  };
  
  const getCategoryName = (id: string) => {
    const category = categories.find((c) => c.id === id);
    return category ? category.name : 'Uncategorized';
  };

  const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const subcategory = category?.subcategories.find((s) => s.id === subcategoryId);
    return subcategory ? subcategory.name : 'Unknown Subcategory';
  };
  
  const getCategoryIcon = (id: string) => {
    const category = categories.find((c) => c.id === id);
    const iconName = category?.icon || 'Receipt';
    const Icon = categoryIcons[iconName];
    return Icon ? <Icon size={16} /> : null;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-gray-600">Manage and track your expenses</p>
        </div>
      </header>
      
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
        
        {/* Filter Panel */}
        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.project}
                  onChange={(e) => handleFilterChange('project', e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {filters.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  >
                    <option value="">All Subcategories</option>
                    {categories
                      .find(c => c.id === filters.category)
                      ?.subcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Mode
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.paymentMode}
                  onChange={(e) => handleFilterChange('paymentMode', e.target.value)}
                >
                  <option value="">All Payment Modes</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {currentExpenses.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Mode
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                            style={{ 
                              backgroundColor: projects.find(p => p.id === expense.projectId)?.color + '20' || '#E5E7EB',
                              color: projects.find(p => p.id === expense.projectId)?.color || '#6B7280'
                            }}
                          >
                            {getProjectName(expense.projectId).charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {getProjectName(expense.projectId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2">
                            {getCategoryIcon(expense.category)}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">
                              {getCategoryName(expense.category)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getSubcategoryName(expense.category, expense.subcategory)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          {expense.paymentMode === 'cheque' && expense.chequeNumber && (
                            <span className="text-gray-900">Cheque ({expense.chequeNumber})</span>
                          )}
                          {expense.paymentMode === 'online' && expense.transactionId && (
                            <span className="text-gray-900">Online ({expense.transactionId})</span>
                          )}
                          {expense.paymentMode === 'cash' && (
                            <span className="text-gray-900">Cash</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onEditExpense(expense.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, sortedExpenses.length)} of{' '}
                  {sortedExpenses.length} expenses
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No expenses found</p>
            {Object.values(filters).some(f => f !== '') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;