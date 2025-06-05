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

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
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
        <div className="flex items-center px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 font-semibold">U</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">User</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;