import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Category, SubCategory } from '../types';
import { ArrowLeft, Tag, Layers, Plus, Trash2, Edit3 } from 'lucide-react';
import { categoryIcons } from '../data/mockData';

interface CategoryFormProps {
  categoryId?: string | null;
  onComplete: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ categoryId, onComplete }) => {
  const { addCategory, updateCategory, getCategoryById } = useExpenses();
  
  const [formData, setFormData] = useState<Omit<Category, 'createdAt'>>({
    id: '',
    name: '',
    icon: 'Tag',
    subcategories: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingSubcategory, setEditingSubcategory] = useState<number | null>(null);
  const isEditMode = Boolean(categoryId);

  // Available icon options
  const availableIcons = Object.keys(categoryIcons);

  useEffect(() => {
    if (categoryId) {
      const category = getCategoryById(categoryId);
      if (category) {
        setFormData({
          id: category.id,
          name: category.name,
          icon: category.icon,
          subcategories: [...category.subcategories]
        });
      }
    }
  }, [categoryId, getCategoryById]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id.trim()) {
      newErrors.id = 'Category ID is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.id.trim())) {
      newErrors.id = 'Category ID must contain only lowercase letters, numbers, and hyphens';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (!formData.icon) {
      newErrors.icon = 'Category icon is required';
    }

    if (formData.subcategories.length === 0) {
      newErrors.subcategories = 'At least one subcategory is required';
    }

    // Validate subcategories
    formData.subcategories.forEach((subcategory, index) => {
      if (!subcategory.id.trim()) {
        newErrors[`subcategory_${index}_id`] = 'Subcategory ID is required';
      } else if (!/^[a-z0-9-]+$/.test(subcategory.id.trim())) {
        newErrors[`subcategory_${index}_id`] = 'Subcategory ID must contain only lowercase letters, numbers, and hyphens';
      }
      
      if (!subcategory.name.trim()) {
        newErrors[`subcategory_${index}_name`] = 'Subcategory name is required';
      }
      
      if (!subcategory.icon) {
        newErrors[`subcategory_${index}_icon`] = 'Subcategory icon is required';
      }
    });

    // Check for duplicate subcategory IDs
    const subcategoryIds = formData.subcategories.map(sub => sub.id.toLowerCase());
    const duplicateIds = subcategoryIds.filter((id, index) => 
      id && subcategoryIds.indexOf(id) !== index
    );
    if (duplicateIds.length > 0) {
      newErrors.subcategories = 'Duplicate subcategory IDs are not allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const categoryData = {
        ...formData,
        id: formData.id.trim().toLowerCase(),
        name: formData.name.trim(),
        subcategories: formData.subcategories.map(sub => ({
          ...sub,
          id: sub.id.trim().toLowerCase(),
          name: sub.name.trim()
        }))
      };

      if (isEditMode && categoryId) {
        await updateCategory(categoryId, categoryData);
      } else {
        await addCategory(categoryData);
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const addSubcategory = () => {
    const newSubcategory: SubCategory = {
      id: '',
      name: '',
      icon: 'Layers'
    };
    
    setFormData(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, newSubcategory]
    }));
  };

  const removeSubcategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index)
    }));
    
    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[`subcategory_${index}_id`];
    delete newErrors[`subcategory_${index}_name`];
    delete newErrors[`subcategory_${index}_icon`];
    setErrors(newErrors);
  };

  const updateSubcategory = (index: number, field: keyof SubCategory, value: string) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.map((sub, i) => 
        i === index ? { ...sub, [field]: value } : sub
      )
    }));
    
    // Clear related error
    const errorKey = `subcategory_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: '',
      }));
    }
  };

  const getIconComponent = (iconName: string, size: number = 20) => {
    const Icon = categoryIcons[iconName];
    return Icon ? <Icon size={size} /> : <Tag size={size} />;
  };

  const generateIdFromName = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <button
          onClick={onComplete}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Category' : 'Add New Category'}
        </h1>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Details */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Category Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category ID
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  disabled={isEditMode}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.id ? 'border-red-500' : 'border-gray-300'
                  } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="e.g., office, construction"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must contain only lowercase letters, numbers, and hyphens
                </p>
                {errors.id && (
                  <p className="mt-1 text-sm text-red-500">{errors.id}</p>
                )}
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    handleChange(e);
                    // Auto-generate ID from name if not in edit mode
                    if (!isEditMode && !formData.id) {
                      const generatedId = generateIdFromName(e.target.value);
                      setFormData(prev => ({ ...prev, id: generatedId }));
                    }
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Office Expenses"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Category Icon */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category Icon
              </label>
              <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {availableIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, icon: iconName }));
                      if (errors.icon) {
                        setErrors(prev => ({ ...prev, icon: '' }));
                      }
                    }}
                    className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                      formData.icon === iconName
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {getIconComponent(iconName)}
                  </button>
                ))}
              </div>
              {errors.icon && (
                <p className="mt-1 text-sm text-red-500">{errors.icon}</p>
              )}
            </div>
          </div>

          {/* Subcategories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Subcategories</h2>
              <button
                type="button"
                onClick={addSubcategory}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Add Subcategory
              </button>
            </div>

            {formData.subcategories.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Layers size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subcategories yet</h3>
                <p className="text-gray-500 mb-4">
                  Add subcategories to organize your expenses better
                </p>
                <button
                  type="button"
                  onClick={addSubcategory}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Add First Subcategory
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.subcategories.map((subcategory, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700">
                        Subcategory {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeSubcategory(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Subcategory ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID
                        </label>
                        <input
                          type="text"
                          value={subcategory.id}
                          onChange={(e) => updateSubcategory(index, 'id', e.target.value)}
                          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`subcategory_${index}_id`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., rent, utilities"
                        />
                        {errors[`subcategory_${index}_id`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`subcategory_${index}_id`]}</p>
                        )}
                      </div>

                      {/* Subcategory Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={subcategory.name}
                          onChange={(e) => {
                            updateSubcategory(index, 'name', e.target.value);
                            // Auto-generate ID from name if ID is empty
                            if (!subcategory.id) {
                              const generatedId = generateIdFromName(e.target.value);
                              updateSubcategory(index, 'id', generatedId);
                            }
                          }}
                          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`subcategory_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Rent, Utilities"
                        />
                        {errors[`subcategory_${index}_name`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`subcategory_${index}_name`]}</p>
                        )}
                      </div>

                      {/* Subcategory Icon */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Icon
                        </label>
                        <div className="relative">
                          <select
                            value={subcategory.icon}
                            onChange={(e) => updateSubcategory(index, 'icon', e.target.value)}
                            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors[`subcategory_${index}_icon`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            {availableIcons.map((iconName) => (
                              <option key={iconName} value={iconName}>
                                {iconName}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-8 top-2 pointer-events-none">
                            {getIconComponent(subcategory.icon, 16)}
                          </div>
                        </div>
                        {errors[`subcategory_${index}_icon`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`subcategory_${index}_icon`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.subcategories && (
              <p className="mt-2 text-sm text-red-500">{errors.subcategories}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
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
              {isEditMode ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm; 