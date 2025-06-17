export type Project = {
  id: string;
  name: string;
  color: string;
  location: string;
  commenceDate: string;
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

export type Customer = {
  id: string;
  name: string;
  plotNumber: string;
  plotSize: number;
  builtUpArea: number;
  projectId: string;
  salePrice: number;
  pricePerYard: number;
  constructionPrice: number;
  constructionPricePerSqft: number;
  createdAt: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type Employee = {
  id: string;
  employeeId: string;
  name: string;
  jobTitle: string;
  salary: number;
  phone: string;
  address: string;
  createdAt: string;
  email?: string;
  joiningDate: string;
  status: 'active' | 'inactive';
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
  employeeId?: string;
  salaryMonth?: string;
  overrideSalary?: number;
  landlordId?: string;
  landPurchaseAmount?: number;
  landDetails?: string;
};

export type ExpenseContextType = {
  expenses: Expense[];
  incomes: Income[];
  customerPayments: CustomerPayment[];
  customers: Customer[];
  employees: Employee[];
  landlords: Landlord[];
  projects: Project[];
  categories: Category[];
  isLoadingCustomers: boolean;
  isLoadingProjects: boolean;
  isLoadingCategories: boolean;
  isLoadingIncomes: boolean;
  isLoadingLandlords: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => Promise<void>;
  updateIncome: (id: string, income: Omit<Income, 'id' | 'createdAt'>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  getIncomeById: (id: string) => Promise<Income | null>;
  refreshIncomes: () => Promise<void>;
  addCustomerPayment: (payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => void;
  updateCustomerPayment: (id: string, payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => void;
  deleteCustomerPayment: (id: string) => void;
  getCustomerPaymentById: (id: string) => CustomerPayment | undefined;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  refreshCustomers: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, employee: Omit<Employee, 'id' | 'createdAt'>) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  addLandlord: (landlord: Omit<Landlord, 'id' | 'createdAt' | 'totalLandPrice'>) => Promise<void>;
  updateLandlord: (id: string, landlord: Omit<Landlord, 'id' | 'createdAt' | 'totalLandPrice'>) => Promise<void>;
  deleteLandlord: (id: string) => Promise<void>;
  getLandlordById: (id: string) => Promise<Landlord | undefined>;
  refreshLandlords: () => Promise<void>;
  addProject: (project: Omit<Project, '_id'>) => Promise<void>;
  updateProject: (id: string, project: Omit<Project, '_id'>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getSubCategoryById: (categoryId: string, subcategoryId: string) => SubCategory | undefined;
  addCategory: (category: Omit<Category, 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, category: Omit<Category, 'createdAt'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
};

export type ActiveView = 'dashboard' | 'expenses' | 'income' | 'customer-payments' | 'projects' | 'reports' | 'customers' | 'employees' | 'landlords' | 'categories' | 'audit-logs' | 'add' | 'add-income' | 'add-customer-payment' | 'add-customer' | 'add-employee' | 'add-landlord' | 'add-category' | 'edit' | 'edit-income' | 'edit-customer-payment' | 'edit-customer' | 'edit-employee' | 'edit-landlord' | 'edit-category';

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

export type Landlord = {
  id: string;
  name: string;
  amount: number; // Advance or initial amount paid
  pricePerAcre: number;
  totalExtent: number; // Total acres
  totalLandPrice: number; // Auto-calculated: pricePerAcre * totalExtent
  phone?: string;
  address?: string;
  email?: string;
  createdAt: string;
  status: 'active' | 'inactive';
};

export type AuditLogAction = 'CREATE' | 'UPDATE' | 'DELETE';

export type AuditLogEntityType = 'expense' | 'income' | 'customer-payment' | 'customer' | 'employee' | 'landlord' | 'project' | 'category';

export type AuditLog = {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  action: AuditLogAction;
  entityType: AuditLogEntityType;
  entityId: string;
  changes: {
    old: any;
    new: any;
  };
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    description?: string;
  };
  timestamp: string;
};

export type AuditLogFilterOptions = {
  entityType: string;
  action: string;
  startDate: string;
  endDate: string;
  entityId: string;
  search: string;
};

export type AuditLogStats = {
  total: number;
  actionBreakdown: Record<AuditLogAction, number>;
  entityBreakdown: Record<AuditLogEntityType, number>;
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
};
