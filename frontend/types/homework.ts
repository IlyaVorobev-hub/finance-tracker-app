export type HomeworkType = "text" | "file" | "mixed";
export type HomeworkStatus = "pending" | "submitted" | "graded" | "archived";

export interface HomeworkFile {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at?: string;
}

export interface Homework {
  id: string;
  student_id: string;
  tutor_id: string;
  title: string;
  description?: string | null;
  type: HomeworkType;
  due_date: string;
  status: HomeworkStatus;
  grade?: string | null;
  files: HomeworkFile[];
  student_name?: string | null;
  created_at: string;
}

export interface HomeworkFilter {
  status?: HomeworkStatus | "all";
  student_id?: string;
  page?: number;
  per_page?: number;
}

export interface HomeworkListResponse {
  homework: Homework[];
  total: number;
}

export interface CreateHomeworkData {
  student_id: string;
  title: string;
  description: string;
  type: HomeworkType;
  due_date: string;
}

export interface UpdateHomeworkData extends Partial<CreateHomeworkData> {
  grade?: string | null;
}
