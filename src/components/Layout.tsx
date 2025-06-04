import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import ExpenseList from './ExpenseList';
import IncomeList from './IncomeList';
import ProjectList from './ProjectList';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';
import { ActiveView } from '../types';
import { Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [editIncomeId, setEditIncomeId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleEditExpense = (id: string) => {
    setEditExpenseId(id);
    setActiveView('edit');
  };

  const handleEditIncome = (id: string) => {
    setEditIncomeId(id);
    setActiveView('edit-income');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpenseList onEditExpense={handleEditExpense} />;
      case 'income':
        return <IncomeList onEditIncome={handleEditIncome} />;
      case 'projects':
        return <ProjectList />;
      case 'add':
        return <ExpenseForm onComplete={() => setActiveView('expenses')} />;
      case 'add-income':
        return <IncomeForm onComplete={() => setActiveView('income')} />;
      case 'edit':
        return (
          <ExpenseForm
            expenseId={editExpenseId}
            onComplete={() => setActiveView('expenses')}
          />
        );
      case 'edit-income':
        return (
          <IncomeForm
            incomeId={editIncomeId}
            onComplete={() => setActiveView('income')}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 bg-white rounded-md shadow-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-30 md:hidden transform ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsMobileSidebarOpen(false)}></div>
        <div className="relative z-10 w-64 h-full bg-white shadow-lg">
          <Sidebar
            activeView={activeView}
            setActiveView={(view) => {
              setActiveView(view);
              setIsMobileSidebarOpen(false);
            }}
          />
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:block w-64 h-screen bg-white shadow-lg">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-4 md:p-8 max-w-6xl mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default Layout;