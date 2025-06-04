import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight, FileSpreadsheet, File as FilePdf, Printer } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { FilterOptions } from '../types';
import { categoryIcons } from '../data/mockData';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    startDate: '',
    endDate: '',
    searchQuery: '',
  });

  // Apply filters and search
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (filters.project && expense.projectId !== filters.project) {
        return false;
      }
      
      if (filters.category && expense.category !== filters.category) {
        return false;
      }
      
      if (filters.startDate && expense.date < filters.startDate) {
        return false;
      }
      
      if (filters.endDate && expense.date > filters.endDate) {
        return false;
      }
      
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
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setFilters({
      project: '',
      category: '',
      startDate: '',
      endDate: '',
      searchQuery: '',
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
  
  const getProjectName = (id: string) => {
    const project = projects.find((p) => p.id === id);
    return project ? project.name : 'Unknown Project';
  };
  
  const getCategoryName = (id: string) => {
    const category = categories.find((c) => c.id === id);
    return category ? category.name : 'Uncategorized';
  };
  
  const getCategoryIcon = (id: string) => {
    const category = categories.find((c) => c.id === id);
    const iconName = category?.icon || 'Receipt';
    const Icon = categoryIcons[iconName];
    return Icon ? <Icon size={16} /> : null;
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = sortedExpenses.map(expense => ({
      Date: format(parseISO(expense.date), 'MMM dd, yyyy'),
      Project: getProjectName(expense.projectId),
      Category: getCategoryName(expense.category),
      Description: expense.description,
      Amount: formatCurrency(expense.amount)
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Expenses');

    const colWidths = [
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 12 },
    ];
    ws['!cols'] = colWidths;

    writeFile(wb, 'expenses.xlsx');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Expense Report', 14, 20);
    
    if (filters.startDate && filters.endDate) {
      doc.setFontSize(10);
      doc.text(
        `Date Range: ${format(parseISO(filters.startDate), 'MMM dd, yyyy')} - ${format(parseISO(filters.endDate), 'MMM dd, yyyy')}`,
        14,
        30
      );
    }

    const tableData = sortedExpenses.map(expense => [
      format(parseISO(expense.date), 'MMM dd, yyyy'),
      getProjectName(expense.projectId),
      getCategoryName(expense.category),
      expense.description,
      formatCurrency(expense.amount)
    ]);

    autoTable(doc, {
      head: [['Date', 'Project', 'Category', 'Description', 'Amount']],
      body: tableData,
      startY: filters.startDate && filters.endDate ? 35 : 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 65 },
        4: { cellWidth: 25, halign: 'right' }
      }
    });

    const total = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const finalY = (doc as any).lastAutoTable.finalY || 280;
    doc.setFontSize(10);
    doc.text(`Total: ${formatCurrency(total)}`, 170, finalY + 10, { align: 'right' });

    doc.save('expenses.pdf');
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print-reset">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-gray-600">Manage and track your expenses</p>
        </div>
        
        {/* Export and Print Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <FileSpreadsheet size={18} />
            <span>Export Excel</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <FilePdf size={18} />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Printer size={18} />
            <span>Print</span>
          </button>
        </div>
      </header>
      
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Expense Report</h1>
        {(filters.startDate || filters.endDate) && (
          <p className="text-gray-600">
            Date Range: {filters.startDate && format(parseISO(filters.startDate), 'MMM dd, yyyy')} 
            {' - '} 
            {filters.endDate && format(parseISO(filters.endDate), 'MMM dd, yyyy')}
          </p>
        )}
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 no-print">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print-reset">
        {sortedExpenses.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full print-table">
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center mr-2 print:hidden"
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
                          <span className="text-gray-500 mr-2 print:hidden">
                            {getCategoryIcon(expense.category)}
                          </span>
                          <span className="text-sm text-gray-900">
                            {getCategoryName(expense.category)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm no-print">
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
                <tfoot className="border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right font-medium">
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {formatCurrency(sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
                    </td>
                    <td className="px-6 py-4 no-print"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between no-print">
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