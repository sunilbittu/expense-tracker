import React, { useMemo, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { 
  TrendingDown, 
  IndianRupee,
  Filter,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Landmark,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths } from 'date-fns';
import ExpenseSummaryChart from './ExpenseSummaryChart';
import ExpenseCategoryChart from './ExpenseCategoryChart';

const Dashboard: React.FC = () => {
  const { expenses, incomes, customerPayments, employees, landlords } = useExpenses();
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  // Filter transactions by date range
  const filteredData = useMemo(() => {
    const filterByDate = (items: any[]) => {
      return items.filter((item) => {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, {
          start: parseISO(dateRange.startDate),
          end: parseISO(dateRange.endDate),
        });
      });
    };

    return {
      expenses: filterByDate(expenses),
      incomes: filterByDate(incomes),
      customerPayments: filterByDate(customerPayments)
    };
  }, [expenses, incomes, customerPayments, dateRange]);

  // Calculate totals
  const totals = useMemo(() => {
    const expenseTotal = filteredData.expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const incomeTotal = filteredData.incomes.reduce((acc, income) => acc + income.amount, 0);
    const paymentsTotal = filteredData.customerPayments.reduce((acc, payment) => acc + payment.amount, 0);
    const totalReceived = incomeTotal + paymentsTotal;
    const netBalance = totalReceived - expenseTotal;

    // Calculate salary expenses
    const salaryExpenses = filteredData.expenses.filter(
      expense => expense.category === 'office' && expense.subcategory === 'salaries'
    ).reduce((acc, expense) => acc + expense.amount, 0);

    return {
      expenses: expenseTotal,
      incomes: incomeTotal,
      payments: paymentsTotal,
      totalReceived,
      netBalance,
      salaryExpenses
    };
  }, [filteredData]);

  // Customer payment statistics
  const paymentStats = useMemo(() => {
    const totalDue = customerPayments.reduce((acc, payment) => acc + payment.totalPrice, 0);
    const totalReceived = customerPayments.reduce((acc, payment) => acc + payment.amount, 0);
    const totalPending = totalDue - totalReceived;
    const uniqueCustomers = new Set(customerPayments.map(p => p.customerName)).size;

    return {
      totalDue,
      totalReceived,
      totalPending,
      uniqueCustomers
    };
  }, [customerPayments]);

  // Employee statistics
  const employeeStats = useMemo(() => {
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const totalSalary = employees.reduce((acc, emp) => acc + emp.salary, 0);
    
    return {
      totalEmployees: employees.length,
      activeEmployees,
      totalSalary
    };
  }, [employees]);

  // Landlord statistics
  const landlordStats = useMemo(() => {
    const activeLandlords = landlords.filter(landlord => landlord.status === 'active').length;
    const totalLandValue = landlords.reduce((acc, landlord) => acc + landlord.totalLandPrice, 0);
    const totalAdvanceAmount = landlords.reduce((acc, landlord) => acc + landlord.amount, 0);
    const totalAcres = landlords.reduce((acc, landlord) => acc + landlord.totalExtent, 0);
    
    return {
      totalLandlords: landlords.length,
      activeLandlords,
      totalLandValue,
      totalAdvanceAmount,
      totalAcres
    };
  }, [landlords]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
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
            Financial overview and analytics
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
            <h3 className="text-gray-500 text-sm font-medium">Net Balance</h3>
            <span className={`p-2 rounded-lg ${totals.netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totals.netBalance >= 0 ? (
                <ArrowUpRight size={18} className="text-green-600" />
              ) : (
                <ArrowDownRight size={18} className="text-red-600" />
              )}
            </span>
          </div>
          <p className={`mt-2 text-2xl font-bold ${totals.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totals.netBalance)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Total income minus expenses
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Total Income</h3>
            <span className="p-2 bg-green-100 rounded-lg">
              <IndianRupee size={18} className="text-green-600" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {formatCurrency(totals.totalReceived)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Investment + Customer Payments
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Total Expenses</h3>
            <span className="p-2 bg-red-100 rounded-lg">
              <TrendingDown size={18} className="text-red-600" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {formatCurrency(totals.expenses)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            All expenses combined
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Customer Payments</h3>
            <span className="p-2 bg-purple-100 rounded-lg">
              <Users size={18} className="text-purple-600" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {formatCurrency(totals.payments)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {paymentStats.uniqueCustomers} active customers
          </p>
        </div>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Total Employees</h3>
            <span className="p-2 bg-blue-100 rounded-lg">
              <Users size={18} className="text-blue-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{employeeStats.totalEmployees}</p>
          <p className="mt-1 text-sm text-gray-500">
            {employeeStats.activeEmployees} active employees
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Monthly Salary</h3>
            <span className="p-2 bg-green-100 rounded-lg">
              <Wallet size={18} className="text-green-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(employeeStats.totalSalary)}</p>
          <p className="mt-1 text-sm text-gray-500">Total monthly payroll</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Salary Expenses</h3>
            <span className="p-2 bg-red-100 rounded-lg">
              <TrendingDown size={18} className="text-red-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.salaryExpenses)}</p>
          <p className="mt-1 text-sm text-gray-500">This period</p>
        </div>
      </div>

      {/* Landlord Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Total Landlords</h3>
            <span className="p-2 bg-orange-100 rounded-lg">
              <Users size={18} className="text-orange-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{landlordStats.totalLandlords}</p>
          <p className="mt-1 text-sm text-gray-500">
            {landlordStats.activeLandlords} active landlords
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Total Land Value</h3>
            <span className="p-2 bg-green-100 rounded-lg">
              <Landmark size={18} className="text-green-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(landlordStats.totalLandValue)}</p>
          <p className="mt-1 text-sm text-gray-500">Total property value</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Advance Payments</h3>
            <span className="p-2 bg-blue-100 rounded-lg">
              <Wallet size={18} className="text-blue-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(landlordStats.totalAdvanceAmount)}</p>
          <p className="mt-1 text-sm text-gray-500">Total advance paid</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Total Acres</h3>
            <span className="p-2 bg-purple-100 rounded-lg">
              <Landmark size={18} className="text-purple-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{landlordStats.totalAcres.toFixed(2)}</p>
          <p className="mt-1 text-sm text-gray-500">Total land area</p>
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

      {/* Recent Transactions */}
    </div>
  );
};

export default Dashboard;