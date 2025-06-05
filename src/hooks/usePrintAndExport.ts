import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PrintAndExportOptions {
  title: string;
  filename: string;
  data: any[];
  columns: Array<{
    header: string;
    dataKey: string;
    width?: number;
  }>;
  formatCurrency?: (amount: number) => string;
  formatDate?: (date: string) => string;
}

export const usePrintAndExport = () => {
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const handlePrint = useCallback((containerId: string) => {
    const printContent = document.getElementById(containerId);
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printableContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #333;
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .print-header h1 { 
              margin: 0; 
              font-size: 24px;
              color: #333;
            }
            .print-header p { 
              margin: 5px 0 0 0; 
              color: #666;
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
              color: #333;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .currency { 
              text-align: right; 
              font-weight: bold;
            }
            .date { 
              white-space: nowrap; 
            }
            .print-stats {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 20px;
              padding: 15px;
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 5px;
            }
            .print-stats .stat-item {
              text-align: center;
              padding: 10px;
              background-color: white;
              border-radius: 3px;
              border: 1px solid #e9ecef;
            }
            .print-stats .stat-value {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin: 5px 0;
            }
            .print-stats .stat-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            @media print {
              body { margin: 0; }
              .print-header { page-break-after: avoid; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              .print-stats { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printableContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }, []);

  const exportToPDF = useCallback((options: PrintAndExportOptions) => {
    const { title, filename, data, columns } = options;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 20, 25);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 35);
    
    // Prepare table data
    const tableData = data.map(item => {
      return columns.map(col => {
        let value = item[col.dataKey];
        
        // Format currency if the value is a number and column seems to be currency
        if (typeof value === 'number' && (col.dataKey.includes('amount') || col.dataKey.includes('price') || col.dataKey.includes('salary'))) {
          value = formatCurrency(value);
        }
        
        // Format date if the column seems to be a date
        if (typeof value === 'string' && (col.dataKey.includes('date') || col.dataKey.includes('Date'))) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              value = formatDate(value);
            }
          } catch (e) {
            // Keep original value if date parsing fails
          }
        }
        
        return value || '';
      });
    });
    
    // Generate table
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: tableData,
      startY: 45,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: columns.reduce((styles, col, index) => {
        if (col.width) {
          styles[index] = { cellWidth: col.width };
        }
        // Right align currency columns
        if (col.dataKey.includes('amount') || col.dataKey.includes('price') || col.dataKey.includes('salary')) {
          styles[index] = { ...styles[index], halign: 'right' };
        }
        return styles;
      }, {} as any),
      margin: { top: 45, left: 20, right: 20 },
    });
    
    // Add footer with total count
    const finalY = (doc as any).lastAutoTable.finalY || 45;
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Total Records: ${data.length}`, 20, finalY + 15);
    
    // Save the PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  }, [formatCurrency, formatDate]);

  return {
    handlePrint,
    exportToPDF,
    formatCurrency,
    formatDate,
  };
};

export default usePrintAndExport; 