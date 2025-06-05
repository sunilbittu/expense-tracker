import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Briefcase, 
  PlusCircle,
  LogOut,
  DollarSign,
  Users,
  FileSpreadsheet,
  Landmark
} from 'lucide-react';
import { ActiveView } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { user, logout } = useAuth();
  
  // Get the first letter of the email for the avatar
  const getAvatarLetter = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  // Get avatar background color based on email
  const getAvatarColor = (email: string) => {
    if (!email) return 'bg-gray-400';
    
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    
    // Simple hash function to consistently pick a color based on email
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'expenses', label: 'Expenses', icon: <Receipt size={20} /> },
    { id: 'income', label: 'Income', icon: <DollarSign size={20} /> },
    { id: 'customer-payments', label: 'Customer Payments', icon: <Users size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'employees', label: 'Employees', icon: <Users size={20} /> },
    { id: 'landlords', label: 'Landlords', icon: <Landmark size={20} /> },
    { id: 'projects', label: 'Projects', icon: <Briefcase size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet size={20} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="text-blue-600">Expense</span>Track
        </h1>
      </div>
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id as ActiveView)}
                className={`w-full flex items-center py-3 px-4 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 mt-auto space-y-2">
        <button
          onClick={() => setActiveView('add')}
          className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          <span>Add Expense</span>
        </button>
        
        <button
          onClick={() => setActiveView('add-income')}
          className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          <span>Add Income</span>
        </button>

        <button
          onClick={() => setActiveView('add-customer-payment')}
          className="w-full flex items-center justify-center py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          <span>Add Customer Payment</span>
        </button>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full ${getAvatarColor(user?.email || '')} flex items-center justify-center`}>
              <span className="text-white font-semibold text-sm">
                {getAvatarLetter(user?.email || '')}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;