export interface Student {
  id: string;
  tutor_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  lesson_price: number;
  notes: string;
  status: "active" | "paused" | "finished";
  created_at: string;
  updated_at: string;
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
  date: string;
  time: string;
  duration: number;
  subject: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
  payment_status: "paid" | "unpaid";
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  date: string;
  method: string;
  notes: string;
  created_at: string;
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  lesson_price: number;
  notes: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  status?: Student["status"];
}
