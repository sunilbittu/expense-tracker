import React, { useState, useEffect } from 'react';
import { useExpenseContext } from '../context/ExpenseContext';

interface IncomeFormProps {
  incomeId?: string | null;
  onComplete: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ incomeId, onComplete }) => {
  const { addIncome, updateIncome, getIncomeById } = useExpenseContext();
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (incomeId) {
      const income = getIncomeById(incomeId);
      if (income) {
        setAmount(income.amount.toString());
        setDescription(income.description);
        setDate(new Date(income.date).toISOString().split('T')[0]);
      }
    }
  }, [incomeId, getIncomeById]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const incomeData = {
      amount: parseFloat(amount),
      description,
      date: new Date(date).toISOString(),
    };

    if (incomeId) {
      updateIncome(incomeId, incomeData);
    } else {
      addIncome(incomeData);
    }

    onComplete();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">
        {incomeId ? 'Edit Income' : 'Add New Income'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {incomeId ? 'Update' : 'Add'} Income
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;