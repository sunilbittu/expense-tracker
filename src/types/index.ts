import { IconName } from 'lucide-react';

export type Project = {
  id: string;
  name: string;
  color: string;
};

export type SubCategory = {
  id: string;
  name: string;
  icon: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  subcategories: SubCategory[];
};

export type PaymentMode = 'cash' | 'online' | 'cheque';

export type TransactionType = 'expense' | 'income' | 'customer-payment';

export type Income = {
  id: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
  paymentMode: PaymentMode;
  chequeNumber?: string;
  transactionId?: string;
  source: string;
  payee: string;
};

export type PaymentCategory = 'token' | 'advance' | 'booking' | 'construction' | 'development' | 'clubhouse' | 'final';

export type CustomerPayment = {
  id: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
  paymentMode: PaymentMode;
  chequeNumber?: string;
  transactionId?: string;
  customerName: string;
  invoiceNumber?: string;
  projectId: string;
  plotNumber: string;
  paymentCategory: PaymentCategory;
  totalPrice: number;
  developmentCharges: number;
  clubhouseCharges: number;
  constructionCharges: number;
};

export type Expense = {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  category: string;
  subcategory: string;
  description: string;
  createdAt: string;
  paymentMode: PaymentMode;
  chequeNumber?: string;
  transactionId?: string;
};

export type ExpenseContextType = {
  expenses: Expense[];
  incomes: Income[];
  customerPayments: CustomerPayment[];
  projects: Project[];
  categories: Category[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  updateIncome: (id: string, income: Omit<Income, 'id' | 'createdAt'>) => void;
  deleteIncome: (id: string) => void;
  getIncomeById: (id: string) => Income | undefined;
  addCustomerPayment: (payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => void;
  updateCustomerPayment: (id: string, payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => void;
  deleteCustomerPayment: (id: string) => void;
  getCustomerPaymentById: (id: string) => CustomerPayment | undefined;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getSubCategoryById: (categoryId: string, subcategoryId: string) => SubCategory | undefined;
};

export type ActiveView = 'dashboard' | 'expenses' | 'income' | 'customer-payments' | 'projects' | 'add' | 'add-income' | 'add-customer-payment' | 'edit' | 'edit-income' | 'edit-customer-payment';

export type FilterOptions = {
  project: string;
  category: string;
  subcategory: string;
  startDate: string;
  endDate: string;
  searchQuery: string;
  paymentMode?: PaymentMode;
  paymentCategory?: PaymentCategory;
};