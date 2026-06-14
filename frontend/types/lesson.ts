export interface Lesson {
  id: string;
  student_id: string;
  tutor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  comment: string;
  status: LessonStatus;
  payment_status: PaymentStatus;
  student_name: string;
  created_at: string;
}

export type LessonStatus = "scheduled" | "completed" | "cancelled";
export type PaymentStatus = "paid" | "unpaid";
export type RecurrenceType = "daily" | "weekly" | "biweekly" | "monthly";
export type CalendarViewMode = "day" | "week" | "month";

export interface LessonFilter {
  start_date?: string;
  end_date?: string;
  student_id?: string;
  status?: LessonStatus;
  page?: number;
  per_page?: number;
}

export interface LessonListResponse {
  lessons: Lesson[];
  total: number;
  page?: number;
  per_page?: number;
}

export interface LessonFormData {
  student_id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  comment: string;
}

export interface RescheduleData {
  date: string;
  start_time: string;
  end_time: string;
}

export interface RecurringLessonData {
  recurrence_type: RecurrenceType;
  end_date?: string;
  total_occurrences?: number;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  hourly_rate?: number;
  status: "active" | "paused" | "finished";
}

export interface StudentsResponse {
  students: Student[];
  total: number;
}
