import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Project } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ProjectList: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: '',
    color: '#3B82F6',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3B82F6',
    });
    setErrors({});
  };
  
  const openAddModal = () => {
    setEditingProject(null);
    resetForm();
    setIsModalOpen(true);
  };
  
  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      color: project.color,
    });
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    resetForm();
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject(formData);
    }
    
    closeModal();
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };
  
  // Color options
  const colorOptions = [
    { label: 'Blue', value: '#3B82F6' },
    { label: 'Green', value: '#10B981' },
    { label: 'Red', value: '#EF4444' },
    { label: 'Yellow', value: '#F59E0B' },
    { label: 'Purple', value: '#8B5CF6' },
    { label: 'Pink', value: '#EC4899' },
    { label: 'Indigo', value: '#6366F1' },
    { label: 'Teal', value: '#14B8A6' },
  ];
  
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-600">Manage your expense projects</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </header>
      
      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: project.color + '20',
                  color: project.color,
                }}
              >
                <span className="text-lg font-bold">{project.name.charAt(0)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(project)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
          </div>
        ))}
      </div>
      
      {/* Add/Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-40" onClick={closeModal}></div>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter project name"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  
                  {/* Project Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Color
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map((color) => (
                        <div
                          key={color.value}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`cursor-pointer h-10 rounded-md flex items-center justify-center transition-transform ${
                            formData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color.value }}
                        >
                          {formData.color === color.value && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {editingProject ? 'Update Project' : 'Add Project'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {projects.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-blue-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Projects Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first project to start tracking expenses
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add Your First Project
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectList;