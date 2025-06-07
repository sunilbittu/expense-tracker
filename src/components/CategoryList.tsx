import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Category } from '../types';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Tag,
  Layers,
  Eye
} from 'lucide-react';
import { categoryIcons } from '../data/mockData';

interface CategoryListProps {
  onEditCategory: (id: string) => void;
  onAddCategory: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onEditCategory, onAddCategory }) => {
  const { categories, deleteCategory } = useExpenses();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const itemsPerPage = 10;

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.subcategories.some(sub => 
          sub.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesSearch;
    });
  }, [categories, searchQuery]);

  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }, [filteredCategories]);

  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const currentCategories = sortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (window.confirm(`Are you sure you want to delete the category "${category?.name}"? This action cannot be undone.`)) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  const getCategoryIcon = (iconName: string) => {
    const Icon = categoryIcons[iconName];
    return Icon ? <Icon size={20} className="text-blue-600" /> : <Tag size={20} className="text-blue-600" />;
  };

  const getSubcategoryIcon = (iconName: string) => {
    const Icon = categoryIcons[iconName];
    return Icon ? <Icon size={16} className="text-gray-600" /> : <Layers size={16} className="text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories & Subcategories</h1>
          <p className="text-gray-600">Manage expense categories and subcategories</p>
        </div>
        <button
          onClick={onAddCategory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search categories and subcategories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{sortedCategories.length} categories</span>
            <span>•</span>
            <span>{sortedCategories.reduce((total, cat) => total + cat.subcategories.length, 0)} subcategories</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {currentCategories.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategories
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              {getCategoryIcon(category.icon)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {category.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {category.subcategories.slice(0, 3).map((subcategory) => (
                            <div key={subcategory.id} className="flex items-center text-sm text-gray-700">
                              {getSubcategoryIcon(subcategory.icon)}
                              <span className="ml-2">{subcategory.name}</span>
                            </div>
                          ))}
                          {category.subcategories.length > 3 && (
                            <div className="text-sm text-gray-500">
                              + {category.subcategories.length - 3} more subcategories
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewCategory(category)}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => onEditCategory(category.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit Category"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete Category"
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
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedCategories.length)} to{' '}
                      {Math.min(currentPage * itemsPerPage, sortedCategories.length)} of {sortedCategories.length} categories
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Tag size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? 'Try adjusting your search criteria.' 
                : 'Get started by creating your first expense category.'}
            </p>
            {!searchQuery && (
              <button
                onClick={onAddCategory}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add First Category
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Details Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getCategoryIcon(selectedCategory.icon)}
                  <h3 className="ml-3 text-lg font-medium text-gray-900">
                    {selectedCategory.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category ID</label>
                  <p className="text-sm text-gray-900">{selectedCategory.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategories ({selectedCategory.subcategories.length})
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCategory.subcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        {getSubcategoryIcon(subcategory.icon)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {subcategory.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {subcategory.id}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  onEditCategory(selectedCategory.id);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Edit Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList; 