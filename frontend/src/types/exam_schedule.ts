export interface ExamSchedule {
  id: number;
  title: string;
  description?: string;
  exam_id: number;
  start_time: string;
  end_time: string;
  max_attempts: number;
  is_active: boolean;
  created_by: number;
  created_at: string;
  deleted_at?: string;
}

export interface ExamScheduleCreate {
  title: string;
  description?: string;
  exam_id: number;
  start_time: string;
  end_time: string;
  max_attempts: number;
  is_active: boolean;
  created_by: number;
}

export interface ExamScheduleUpdate {
  title?: string;
  description?: string;
  exam_id?: number;
  start_time?: string;
  end_time?: string;
  max_attempts?: number;
  is_active?: boolean;
  created_by?: number;
}

export interface ExamSchedulePaginationOut {
  total: number;
  skip: number;
  limit: number;
  data: ExamSchedule[];
}

export interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  data: T[];
}
