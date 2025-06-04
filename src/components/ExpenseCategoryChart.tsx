import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useExpenses } from '../context/ExpenseContext';
import { isWithinInterval, parseISO } from 'date-fns';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface ExpenseCategoryChartProps {
  startDate: string;
  endDate: string;
}

const ExpenseCategoryChart: React.FC<ExpenseCategoryChartProps> = ({ startDate, endDate }) => {
  const { expenses, categories } = useExpenses();
  
  const chartData = useMemo(() => {
    // Filter expenses for selected date range
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, {
        start: parseISO(startDate),
        end: parseISO(endDate),
      });
    });
    
    // Group expenses by category
    const categoryTotals = categories.map(category => {
      const categoryExpenses = filteredExpenses.filter(
        expense => expense.category === category.id
      );
      
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        category: category.name,
        total,
      };
    });
    
    // Filter out categories with no expenses
    const filteredCategories = categoryTotals.filter(cat => cat.total > 0);
    
    // If no categories have expenses, return empty data
    if (filteredCategories.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#E5E7EB'],
          borderWidth: 0,
        }]
      };
    }
    
    // Background colors for each category
    const backgroundColors = [
      'rgba(59, 130, 246, 0.7)',  // Blue
      'rgba(16, 185, 129, 0.7)',  // Green
      'rgba(245, 158, 11, 0.7)',  // Amber
      'rgba(239, 68, 68, 0.7)',   // Red
      'rgba(139, 92, 246, 0.7)',  // Purple
      'rgba(20, 184, 166, 0.7)',  // Teal
      'rgba(249, 115, 22, 0.7)',  // Orange
      'rgba(99, 102, 241, 0.7)',  // Indigo
      'rgba(236, 72, 153, 0.7)',  // Pink
      'rgba(75, 85, 99, 0.7)',    // Gray
    ];
    
    return {
      labels: filteredCategories.map(item => item.category),
      datasets: [
        {
          data: filteredCategories.map(item => item.total),
          backgroundColor: backgroundColors.slice(0, filteredCategories.length),
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    };
  }, [expenses, categories, startDate, endDate]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            
            return `${label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };
  
  return <Doughnut data={chartData} options={options} />;
};

export default ExpenseCategoryChart;