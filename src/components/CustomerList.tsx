import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Users,
  Building2
} from 'lucide-react';
import { FilterOptions } from '../types';

interface CustomerListProps {
  onEditCustomer: (id: string) => void;
  onAddCustomer: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onEditCustomer, onAddCustomer }) => {
  const { customers, deleteCustomer, projects } = useExpenses();
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
  });

  // Apply filters and search
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Project filter
      if (filters.project && customer.projectId !== filters.project) {
        return false;
      }
      
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = customer.name.toLowerCase().includes(query);
        const matchesPlot = customer.plotNumber.toLowerCase().includes(query);
        const matchesProject = projects.find(p => p.id === customer.projectId)?.name.toLowerCase().includes(query);
        
        return matchesName || matchesPlot || matchesProject;
      }
      
      return true;
    });
  }, [customers, filters, projects]);
  
  // Sort customers by name
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredCustomers]);
  
  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const currentCustomers = sortedCustomers.slice(
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
      subcategory: '',
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
  
  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
    }
  };
  
  const getProjectName = (id: string) => {
    const project = projects.find((p) => p.id === id);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button
          onClick={onAddCustomer}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
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
              placeholder="Search customers..."
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
      
      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {currentCustomers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plot Number
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plot Size
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sale Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Yard
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Construction Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Construction Price/Sqft
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <Users size={14} className="text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500">
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                            style={{ 
                              backgroundColor: projects.find(p => p.id === customer.projectId)?.color + '20' || '#E5E7EB',
                              color: projects.find(p => p.id === customer.projectId)?.color || '#6B7280'
                            }}
                          >
                            <Building2 size={12} />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {getProjectName(customer.projectId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.plotNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {customer.plotSize} sq yards
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(customer.salePrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {formatCurrency(customer.pricePerYard)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(customer.constructionPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {formatCurrency(customer.constructionPricePerSqft)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onEditCustomer(customer.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
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
                  {Math.min(currentPage * itemsPerPage, sortedCustomers.length)} of{' '}
                  {sortedCustomers.length} customers
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
            <p className="text-gray-500 mb-4">No customers found</p>
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

export default CustomerList;