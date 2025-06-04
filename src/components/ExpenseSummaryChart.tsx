import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useExpenses } from '../context/ExpenseContext';
import { 
  startOfMonth, 
  endOfMonth, 
  eachMonthOfInterval, 
  format,
  isWithinInterval,
  parseISO
} from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ExpenseSummaryChartProps {
  startDate: string;
  endDate: string;
}

const ExpenseSummaryChart: React.FC<ExpenseSummaryChartProps> = ({ startDate, endDate }) => {
  const { expenses } = useExpenses();
  
  const chartData = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    const months = eachMonthOfInterval({
      start: startOfMonth(start),
      end: endOfMonth(end),
    });
    
    const monthlyTotals = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = parseISO(expense.date);
        return isWithinInterval(expenseDate, {
          start: monthStart,
          end: monthEnd,
        });
      });
      
      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        month: format(month, 'MMM yyyy'),
        total,
      };
    });
    
    return {
      labels: monthlyTotals.map(item => item.month),
      datasets: [
        {
          label: 'Monthly Expenses',
          data: monthlyTotals.map(item => item.total),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [expenses, startDate, endDate]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(context.raw);
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
            }).format(value);
          }
        }
      },
    },
  };
  
  return <Bar data={chartData} options={options} />;
};

export default ExpenseSummaryChart;