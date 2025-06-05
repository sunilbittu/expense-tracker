import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Landlord } from '../types';
import usePrintAndExport from '../hooks/usePrintAndExport';
import { 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Landmark,
  Calculator,
  Printer,
  Download,
  Users
} from 'lucide-react';

interface LandlordListProps {
  onEditLandlord: (landlordId: string) => void;
  onAddLandlord: () => void;
}

const LandlordList: React.FC<LandlordListProps> = ({ onEditLandlord, onAddLandlord }) => {
  const { landlords, deleteLandlord } = useExpenses();
  const { handlePrint, exportToPDF } = usePrintAndExport();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'totalLandPrice' | 'totalExtent' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterOpen, setFilterOpen] = useState(false);

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

  // Filter and search landlords
  const filteredLandlords = useMemo(() => {
    return landlords.filter((landlord) => {
      const matchesSearch = 
        landlord.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        landlord.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        landlord.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        landlord.address?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || landlord.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [landlords, searchQuery, statusFilter]);

  // Sort landlords
  const sortedLandlords = useMemo(() => {
    return [...filteredLandlords].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'totalLandPrice':
          aValue = a.totalLandPrice;
          bValue = b.totalLandPrice;
          break;
        case 'totalExtent':
          aValue = a.totalExtent;
          bValue = b.totalExtent;
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
  }, [filteredLandlords, sortBy, sortOrder]);

  const handleDeleteLandlord = (landlord: Landlord) => {
    if (window.confirm(`Are you sure you want to delete landlord "${landlord.name}"? This action cannot be undone.`)) {
      deleteLandlord(landlord.id);
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Calculate summary statistics
  const totalLandlords = filteredLandlords.length;
  const totalLandValue = filteredLandlords.reduce((sum, landlord) => sum + landlord.totalLandPrice, 0);
  const totalAcres = filteredLandlords.reduce((sum, landlord) => sum + landlord.totalExtent, 0);
  const averagePricePerAcre = totalAcres > 0 ? totalLandValue / totalAcres : 0;

  const handleExportPDF = () => {
    const columns = [
      { header: 'Name', dataKey: 'name' },
      { header: 'Advance Amount', dataKey: 'amount' },
      { header: 'Price Per Acre', dataKey: 'pricePerAcre' },
      { header: 'Total Extent (Acres)', dataKey: 'totalExtent' },
      { header: 'Total Land Price', dataKey: 'totalLandPrice' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Status', dataKey: 'status' },
    ];

    exportToPDF({
      title: 'Landlords Master List',
      filename: 'landlords',
      data: filteredLandlords,
      columns,
    });
  };

  return (
    <div className="space-y-6" id="landlord-list-container">
      {/* Print Header - Hidden on screen, visible in print */}
      <div className="hidden print:block print:mb-6">
        <h1 className="text-2xl font-bold text-center mb-4">Landlords Master List</h1>
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Landlords</p>
            <p className="text-lg font-bold">{totalLandlords}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Land Value</p>
            <p className="text-lg font-bold">{formatCurrency(totalLandValue)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Acres</p>
            <p className="text-lg font-bold">{totalAcres.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Price/Acre</p>
            <p className="text-lg font-bold">{formatCurrency(averagePricePerAcre)}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="mr-3 text-green-600" size={28} />
            Landlords Master List
          </h1>
          <p className="text-gray-600 mt-1">
            Manage landlord information and land details
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handlePrint('landlord-list-container')}
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
            onClick={onAddLandlord}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Landlord
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search landlords by name, phone, email, or address..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                >
                  <option value="name">Name</option>
                  <option value="totalLandPrice">Total Land Price</option>
                  <option value="totalExtent">Total Extent</option>
                  <option value="createdAt">Date Added</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Landlords</p>
              <p className="text-2xl font-bold text-gray-900">{totalLandlords}</p>
            </div>
            <Users className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Land Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalLandValue)}
              </p>
            </div>
            <DollarSign className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Acres</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalAcres.toFixed(2)}
              </p>
            </div>
            <Landmark className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Price/Acre</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(averagePricePerAcre)}
              </p>
            </div>
            <Calculator className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Landlords Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {sortedLandlords.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Landlords Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? "No landlords match your search criteria"
                : "Start by adding your first landlord"}
            </p>
            <button
              onClick={onAddLandlord}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Your First Landlord
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Advance Amount
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalExtent')}
                  >
                    Land Details {sortBy === 'totalExtent' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalLandPrice')}
                  >
                    Total Land Price {sortBy === 'totalLandPrice' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedLandlords.map((landlord) => (
                  <tr key={landlord.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <User size={20} className="text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {landlord.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Added {formatDate(landlord.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {landlord.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone size={14} className="mr-1" />
                            {landlord.phone}
                          </div>
                        )}
                        {landlord.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail size={14} className="mr-1" />
                            {landlord.email}
                          </div>
                        )}
                        {landlord.address && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin size={14} className="mr-1" />
                            <span className="truncate max-w-xs">{landlord.address}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      {formatCurrency(landlord.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="space-y-1">
                        <div className="text-gray-900">
                          {landlord.totalExtent} acres
                        </div>
                        <div className="text-gray-500">
                          @ {formatCurrency(landlord.pricePerAcre)}/acre
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                      {formatCurrency(landlord.totalLandPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        landlord.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {landlord.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium print:hidden">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEditLandlord(landlord.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit Landlord"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLandlord(landlord)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Landlord"
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

export default LandlordList; 