export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  is_system: boolean;
  sort_order: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  category_id: string;
  type: "income" | "expense";
  description: string;
  category?: Category;
  created_at: string;
}

export interface DashboardData {
  current_balance: number;
  month_income: number;
  month_expenses: number;
  recent_transactions: Transaction[];
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  per_page: number;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

export interface TransactionFormData {
  amount: number;
  date: string;
  category_id: string;
  description: string;
  type: "income" | "expense";
}

export interface CategoryFormData {
  name: string;
  type: "income" | "expense";
}

export interface AnalyticsData {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  avg_income: number;
  avg_expenses: number;
  income_by_category: { name: string; value: number }[];
  expenses_by_category: { name: string; value: number }[];
  monthly_trend: { month: string; income: number; expenses: number }[];
}
