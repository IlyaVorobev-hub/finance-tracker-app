export interface DashboardData {
  current_balance: number;
  month_income: number;
  month_expenses: number;
  recent_transactions: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  description: string;
  category: {
    name: string;
  };
}

export interface AnalyticsSummary {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  avg_income: number;
  avg_expenses: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface Lesson {
  id: string;
  student_name?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  status: "active" | "paused" | "finished";
}

export interface StatCardData {
  label: string;
  value: number | string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ElementType;
  format?: "currency" | "number" | "percent";
}

export interface QuickAction {
  label: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  color: string;
}
