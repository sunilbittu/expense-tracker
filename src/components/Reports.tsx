import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Download, FileSpreadsheet, Filter, Calendar, Users, Building2, Receipt } from 'lucide-react';
import { 
  format, 
  subDays, 
  subMonths, 
  startOfYear,
  endOfYear,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  subYears
} from 'date-fns';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
  const { expenses, incomes, customerPayments, projects, categories, employees } = useExpenses();
  const [reportType, setReportType] = useState('expenses');
  const [timeRange, setTimeRange] = useState('monthly');
  const [projectFilter, setProjectFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const getDateRange = () => {
    const today = new Date();
    switch (timeRange) {
      case 'daily':
        return { 
          start: format(startOfDay(today), 'yyyy-MM-dd'), 
          end: format(endOfDay(today), 'yyyy-MM-dd') 
        };
      case 'weekly':
        return { 
          start: format(startOfWeek(today), 'yyyy-MM-dd'), 
          end: format(endOfWeek(today), 'yyyy-MM-dd') 
        };
      case 'monthly':
        return { 
          start: format(startOfMonth(today), 'yyyy-MM-dd'), 
          end: format(endOfMonth(today), 'yyyy-MM-dd') 
        };
      case 'quarterly':
        return { 
          start: format(startOfQuarter(today), 'yyyy-MM-dd'), 
          end: format(endOfQuarter(today), 'yyyy-MM-dd') 
        };
      case 'half-yearly':
        return { 
          start: format(subMonths(today, 6), 'yyyy-MM-dd'), 
          end: format(today, 'yyyy-MM-dd') 
        };
      case 'yearly':
        return { 
          start: format(startOfYear(today), 'yyyy-MM-dd'), 
          end: format(endOfYear(today), 'yyyy-MM-dd') 
        };
      case 'till-date':
        return {
          start: format(subYears(today, 10), 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
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

  const summaryData = useMemo(() => {
    if (reportType === 'expenses') {
      const categoryTotals = {};
      const subcategoryTotals = {};
      
      filteredData.forEach(expense => {
        const category = categories.find(c => c.id === expense.category);
        const categoryName = category ? category.name : 'Uncategorized';
        const subcategory = category?.subcategories.find(s => s.id === expense.subcategory);
        const subcategoryName = subcategory ? subcategory.name : 'Uncategorized';
        
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount;
        subcategoryTotals[`${categoryName}-${subcategoryName}`] = (subcategoryTotals[`${categoryName}-${subcategoryName}`] || 0) + expense.amount;
      });

      return {
        total: filteredData.reduce((sum, item) => sum + item.amount, 0),
        categoryTotals,
        subcategoryTotals
      };
    } else if (reportType === 'income') {
      const payeeTotals = {};
      const sourceTotals = {};
      filteredData.forEach(income => {
        payeeTotals[income.payee] = (payeeTotals[income.payee] || 0) + income.amount;
        sourceTotals[income.source] = (sourceTotals[income.source] || 0) + income.amount;
      });

      return {
        total: filteredData.reduce((sum, item) => sum + item.amount, 0),
        payeeTotals,
        sourceTotals
      };
    } else {
      const customerTotals = {};
      const categoryTotals = {};
      filteredData.forEach(payment => {
        customerTotals[payment.customerName] = (customerTotals[payment.customerName] || 0) + payment.amount;
        categoryTotals[payment.paymentCategory] = (categoryTotals[payment.paymentCategory] || 0) + payment.amount;
      });

      return {
        total: filteredData.reduce((sum, item) => sum + item.amount, 0),
        customerTotals,
        categoryTotals
      };
    }
  }, [filteredData, reportType, categories]);

  const downloadReport = () => {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ['Report Type', reportType.toUpperCase()],
      ['Period', `${format(parseISO(getDateRange().start), 'dd/MM/yyyy')} to ${format(parseISO(getDateRange().end), 'dd/MM/yyyy')}`],
      ['Total Amount', formatCurrency(summaryData.total)],
      [''],
    ];

    if (reportType === 'expenses') {
      summaryData.push(['Category Breakdown']);
      summaryData.push(['Category', 'Amount', 'Percentage']);
      Object.entries(summaryData.categoryTotals).forEach(([category, amount]) => {
        summaryData.push([
          category,
          formatCurrency(amount as number),
          `${((amount as number / summaryData.total) * 100).toFixed(2)}%`
        ]);
      });

      summaryData.push([''], ['Subcategory Breakdown']);
      summaryData.push(['Category', 'Subcategory', 'Amount', 'Percentage']);
      Object.entries(summaryData.subcategoryTotals).forEach(([key, amount]) => {
        const [category, subcategory] = key.split('-');
        summaryData.push([
          category,
          subcategory,
          formatCurrency(amount as number),
          `${((amount as number / summaryData.total) * 100).toFixed(2)}%`
        ]);
      });
    } else if (reportType === 'income') {
      summaryData.push(['Payee Breakdown']);
      summaryData.push(['Payee', 'Amount', 'Percentage']);
      Object.entries(summaryData.payeeTotals).forEach(([payee, amount]) => {
        summaryData.push([
          payee,
          formatCurrency(amount as number),
          `${((amount as number / summaryData.total) * 100).toFixed(2)}%`
        ]);
      });

      summaryData.push([''], ['Source Breakdown']);
      summaryData.push(['Source', 'Amount', 'Percentage']);
      Object.entries(summaryData.sourceTotals).forEach(([source, amount]) => {
        summaryData.push([
          source,
          formatCurrency(amount as number),
          `${((amount as number / summaryData.total) * 100).toFixed(2)}%`
        ]);
      });
    } else {
      summaryData.push(['Customer Breakdown']);
      summaryData.push(['Customer', 'Amount', 'Percentage']);
      Object.entries(summaryData.customerTotals).forEach(([customer, amount]) => {
        summaryData.push([
          customer,
          formatCurrency(amount as number),
          `${((amount as number / summaryData.total) * 100).toFixed(2)}%`
        ]);
      });

      summaryData.push([''], ['Payment Category Breakdown']);
      summaryData.push(['Category', 'Amount', 'Percentage']);
      Object.entries(summaryData.categoryTotals).forEach(([category, amount]) => {
        summaryData.push([
          category,
          formatCurrency(amount as number),
          `${((amount as number / summaryData.total) * 100).toFixed(2)}%`
        ]);
      });
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const detailsData = filteredData.map(item => {
      const baseData = {
        Date: format(parseISO(item.date), 'dd/MM/yyyy'),
        Amount: item.amount,
      };

      if (reportType === 'expenses') {
        return {
          ...baseData,
          Project: projects.find(p => p.id === (item as any).projectId)?.name || '',
          Category: categories.find(c => c.id === (item as any).category)?.name || '',
          Subcategory: categories
            .find(c => c.id === (item as any).category)
            ?.subcategories.find(s => s.id === (item as any).subcategory)?.name || '',
          Description: item.description,
          'Payment Mode': (item as any).paymentMode,
        };
      } else if (reportType === 'income') {
        return {
          ...baseData,
          Payee: (item as any).payee,
          Source: (item as any).source,
          Description: item.description,
          'Payment Mode': (item as any).paymentMode,
        };
      } else {
        return {
          ...baseData,
          Customer: (item as any).customerName,
          Project: projects.find(p => p.id === (item as any).projectId)?.name || '',
          'Plot Number': (item as any).plotNumber,
          'Payment Category': (item as any).paymentCategory,
          'Total Price': (item as any).totalPrice,
        };
      }
    });

    const detailsSheet = XLSX.utils.json_to_sheet(detailsData);
    XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Details');

    const fileName = `${reportType}-report-${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-600">Generate detailed financial reports</p>
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
              <option value="expenses">Expenses Report</option>
              <option value="income">Income Report</option>
              <option value="payments">Customer Payments Report</option>
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
              <option value="half-yearly">Half Yearly</option>
              <option value="yearly">Yearly</option>
              <option value="till-date">Till Date</option>
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
            {filteredData.length} records found | Total: {formatCurrency(summaryData.total)}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportType === 'expenses' && (
          <>
            {Object.entries(summaryData.categoryTotals).map(([category, amount]) => (
              <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-700 font-semibold">{category}</h3>
                  <span className="p-2 bg-blue-100 rounded-lg">
                    <Receipt size={18} className="text-blue-600" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(amount as number)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {((amount as number / summaryData.total) * 100).toFixed(2)}% of total
                </p>
              </div>
            ))}
          </>
        )}

        {reportType === 'income' && (
          <>
            {Object.entries(summaryData.payeeTotals).map(([payee, amount]) => (
              <div key={payee} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-700 font-semibold">{payee}</h3>
                  <span className="p-2 bg-green-100 rounded-lg">
                    <Users size={18} className="text-green-600" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(amount as number)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {((amount as number / summaryData.total) * 100).toFixed(2)}% of total
                </p>
              </div>
            ))}
            {Object.entries(summaryData.sourceTotals).map(([source, amount]) => (
              <div key={source} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-700 font-semibold">{source}</h3>
                  <span className="p-2 bg-green-100 rounded-lg">
                    <Building2 size={18} className="text-green-600" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(amount as number)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {((amount as number / summaryData.total) * 100).toFixed(2)}% of total
                </p>
              </div>
            ))}
          </>
        )}

        {reportType === 'payments' && (
          <>
            {Object.entries(summaryData.customerTotals).map(([customer, amount]) => (
              <div key={customer} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-700 font-semibold">{customer}</h3>
                  <span className="p-2 bg-purple-100 rounded-lg">
                    <Users size={18} className="text-purple-600" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(amount as number)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {((amount as number / summaryData.total) * 100).toFixed(2)}% of total
                </p>
              </div>
            ))}
            {Object.entries(summaryData.categoryTotals).map(([category, amount]) => (
              <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-700 font-semibold">{category}</h3>
                  <span className="p-2 bg-purple-100 rounded-lg">
                    <Receipt size={18} className="text-purple-600" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(amount as number)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {((amount as number / summaryData.total) * 100).toFixed(2)}% of total
                </p>
              </div>
            ))}
          </>
        )}
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
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategory
                    </th>
                  </>
                )}
                {reportType === 'income' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                  </>
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
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {categories.find(c => c.id === (item as any).category)?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {categories
                          .find(c => c.id === (item as any).category)
                          ?.subcategories.find(s => s.id === (item as any).subcategory)?.name}
                      </td>
                    </>
                  )}
                  {reportType === 'income' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(item as any).payee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(item as any).source}
                      </td>
                    </>
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