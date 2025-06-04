import React, { useMemo, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Briefcase,
  Filter
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths } from 'date-fns';
import ExpenseSummaryChart from './ExpenseSummaryChart';
import ExpenseCategoryChart from './ExpenseCategoryChart';

const Dashboard: React.FC = () => {
  const { expenses, projects, categories } = useExpenses();
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, {
        start: parseISO(dateRange.startDate),
        end: parseISO(dateRange.endDate),
      });
    });
  }, [expenses, dateRange]);

  // Total expenses for selected period
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);
  }, [filteredExpenses]);

  // Last 5 expenses
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [expenses]);

  // Highest expense in selected period
  const highestExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return null;
    return filteredExpenses.reduce((max, expense) => 
      expense.amount > max.amount ? expense : max, 
      filteredExpenses[0]);
  }, [filteredExpenses]);

  // Get project by ID
  const getProjectName = (id: string) => {
    const project = projects.find((p) => p.id === id);
    return project ? project.name : 'Unknown Project';
  };

  // Get category by ID
  const getCategoryName = (id: string) => {
    const category = categories.find((c) => c.id === id);
    return category ? category.name : 'Uncategorized';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your expenses
          </p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Total Expenses</h3>
            <span className="p-2 bg-blue-100 rounded-lg">
              <DollarSign size={18} className="text-blue-600" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">{formatCurrency(totalExpenses)}</p>
          <p className="mt-1 text-sm text-gray-500">
            {format(parseISO(dateRange.startDate), 'MMM dd, yyyy')} - {format(parseISO(dateRange.endDate), 'MMM dd, yyyy')}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Highest Expense</h3>
            <span className="p-2 bg-red-100 rounded-lg">
              <TrendingUp size={18} className="text-red-600" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {highestExpense ? formatCurrency(highestExpense.amount) : '$0.00'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {highestExpense ? getCategoryName(highestExpense.category) : 'No expenses'}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Active Projects</h3>
            <span className="p-2 bg-purple-100 rounded-lg">
              <Briefcase size={18} className="text-purple-600" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">{projects.length}</p>
          <p className="mt-1 text-sm text-gray-500">
            Across all categories
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Recent Activity</h3>
            <span className="p-2 bg-green-100 rounded-lg">
              <Calendar size={18} className="text-green-600" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">{recentExpenses.length}</p>
          <p className="mt-1 text-sm text-gray-500">
            New expenses added
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Expenses</h3>
          <div className="h-64">
            <ExpenseSummaryChart startDate={dateRange.startDate} endDate={dateRange.endDate} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
          <div className="h-64">
            <ExpenseCategoryChart startDate={dateRange.startDate} endDate={dateRange.endDate} />
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Recent Expenses</h3>
        </div>
        {recentExpenses.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: projects.find(p => p.id === expense.projectId)?.color + '20' || '#E5E7EB',
                          color: projects.find(p => p.id === expense.projectId)?.color || '#6B7280'
                        }}
                      >
                        {getProjectName(expense.projectId).charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-800">{expense.description}</p>
                      <p className="text-sm text-gray-500">
                        {getProjectName(expense.projectId)} • {getCategoryName(expense.category)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(expense.amount)}</p>
                    <p className="text-sm text-gray-500">{format(parseISO(expense.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No expenses added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;