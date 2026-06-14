export interface SystemStats {
  total_users: number;
  total_tutors: number;
  total_students: number;
  total_lessons: number;
  total_homework: number;
  total_income: number;
  total_expenses: number;
  active_lessons_today: number;
  pending_homework: number;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  lessons_count: number;
  students_count: number;
  income: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

export interface UsersResponse {
  users: Array<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
  }>;
  total: number;
}

export interface AuditLogFilters {
  page?: number;
  per_page?: number;
  user_id?: string;
  action?: string;
}

export interface UserFilters {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}
