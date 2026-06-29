export interface Student {
  id: string;
  tutor_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  subject: string;
  lesson_price: number;
  notes?: string | null;
  status: "active" | "paused" | "finished";
  created_at: string;
  updated_at?: string | null;
}

export interface StudentFilter {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  per_page: number;
}

export interface StudentStats {
  total: number;
  active: number;
  paused: number;
  finished: number;
}

export interface Lesson {
  id: string;
  student_id: string;
  tutor_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  comment?: string | null;
  status: "scheduled" | "completed" | "cancelled";
  payment_status: "paid" | "unpaid";
  student_name?: string;
  created_at: string;
}

export interface Payment {
  lesson_id: string;
  date: string;
  price: number;
  payment_status: "paid" | "unpaid";
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  lesson_price: number;
  notes?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  status?: Student["status"];
}
