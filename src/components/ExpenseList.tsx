// Update the table header and row in ExpenseList.tsx to include payment mode
// Inside the table header section, add:
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Payment Mode
</th>

// Inside the table row mapping, add:
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  <div className="flex items-center">
    {expense.paymentMode === 'cheque' && expense.chequeNumber && (
      <span>Cheque ({expense.chequeNumber})</span>
    )}
    {expense.paymentMode === 'online' && expense.transactionId && (
      <span>Online ({expense.transactionId})</span>
    )}
    {expense.paymentMode === 'cash' && <span>Cash</span>}
  </div>
</td>