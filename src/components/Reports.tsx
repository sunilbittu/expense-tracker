import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Download, FileSpreadsheet, Filter } from 'lucide-react';
import { format, subDays, subMonths, startOfYear, endOfYear, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
  const { expenses, incomes, customerPayments, projects, categories } = useExpenses();
  const [reportType, setReportType] = useState('expenses');
  const [timeRange, setTimeRange] = useState('daily');
  const [projectFilter, setProjectFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const getDateRange = () => {
    const today = new Date();
    switch (timeRange) {
      case 'daily':
        return { start: format(today, 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
      case 'weekly':
        return { start: format(subDays(today, 7), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
      case 'monthly':
        return { start: format(subMonths(today, 1), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
      case 'quarterly':
        return { start: format(subMonths(today, 3), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
      case 'yearly':
        return { 
          start: format(startOfYear(today), 'yyyy-MM-dd'), 
          end: format(endOfYear(today), 'yyyy-MM-dd') 
        };
      case 'custom':
        return { start: startDate, end: endDate };
      default:
        return { start: startDate, end: endDate };
    }
  };

  const filteredData = useMemo(() => {
    const { start, end } = getDateRange();
    let data = [];

    switch (reportType) {
      case 'expenses':
        data = expenses.filter(expense => {
          const date = parseISO(expense.date);
          const isInDateRange = format(date, 'yyyy-MM-dd') >= start && format(date, 'yyyy-MM-dd') <= end;
          const matchesProject = !projectFilter || expense.projectId === projectFilter;
          const matchesCategory = !categoryFilter || expense.category === categoryFilter;
          return isInDateRange && matchesProject && matchesCategory;
        });
        break;
      case 'income':
        data = incomes.filter(income => {
          const date = parseISO(income.date);
          return format(date, 'yyyy-MM-dd') >= start && format(date, 'yyyy-MM-dd') <= end;
        });
        break;
      case 'payments':
        data = customerPayments.filter(payment => {
          const date = parseISO(payment.date);
          const isInDateRange = format(date, 'yyyy-MM-dd') >= start && format(date, 'yyyy-MM-dd') <= end;
          const matchesProject = !projectFilter || payment.projectId === projectFilter;
          return isInDateRange && matchesProject;
        });
        break;
    }

    return data;
  }, [reportType, timeRange, projectFilter, categoryFilter, startDate, endDate, expenses, incomes, customerPayments]);

  const downloadReport = () => {
    const reportData = filteredData.map(item => {
      const baseData = {
        Date: format(parseISO(item.date), 'dd/MM/yyyy'),
        Amount: item.amount,
      };

      switch (reportType) {
        case 'expenses':
          return {
            ...baseData,
            Project: projects.find(p => p.id === (item as any).projectId)?.name || '',
            Category: categories.find(c => c.id === (item as any).category)?.name || '',
            Description: item.description,
            'Payment Mode': (item as any).paymentMode,
          };
        case 'income':
          return {
            ...baseData,
            Source: (item as any).source,
            Description: item.description,
            'Payment Mode': (item as any).paymentMode,
          };
        case 'payments':
          return {
            ...baseData,
            Customer: (item as any).customerName,
            Project: projects.find(p => p.id === (item as any).projectId)?.name || '',
            'Plot Number': (item as any).plotNumber,
            'Payment Category': (item as any).paymentCategory,
            'Total Price': (item as any).totalPrice,
            'Development Charges': (item as any).developmentCharges,
            'Clubhouse Charges': (item as any).clubhouseCharges,
            'Construction Charges': (item as any).constructionCharges,
          };
        default:
          return baseData;
      }
    });

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    
    const fileName = `${reportType}-report-${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-600">Generate and download detailed reports</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="expenses">Expenses</option>
              <option value="income">Income</option>
              <option value="payments">Customer Payments</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {timeRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {(reportType === 'expenses' || reportType === 'payments') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'expenses' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredData.length} records found | Total: {formatCurrency(totalAmount)}
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {reportType === 'payments' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                )}
                {(reportType === 'expenses' || reportType === 'payments') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                )}
                {reportType === 'expenses' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                )}
                {reportType === 'income' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(parseISO(item.date), 'dd/MM/yyyy')}
                  </td>
                  {reportType === 'payments' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(item as any).customerName}
                    </td>
                  )}
                  {(reportType === 'expenses' || reportType === 'payments') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {projects.find(p => p.id === (item as any).projectId)?.name}
                    </td>
                  )}
                  {reportType === 'expenses' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {categories.find(c => c.id === (item as any).category)?.name}
                    </td>
                  )}
                  {reportType === 'income' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(item as any).source}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;