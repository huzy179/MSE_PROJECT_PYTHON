// Exam types
export interface ExamQuestion {
  id: number;
  question_id: number;
  question_order: number;
  choice_order: string;
  exam_id: number;
  created_at: string;
}

export interface Exam {
  id: number;
  code: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  total_questions: number;
  description?: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ExamWithQuestions extends Exam {
  exam_questions: ExamQuestion[];
}

export interface ExamCreate {
  code: string;
  title: string;
  subject: string;
  duration: number;
  total_questions: number;
  description?: string;
  is_active?: boolean;
}

export interface ExamUpdate {
  code?: string;
  title?: string;
  subject?: string;
  duration?: number;
  total_questions?: number;
  description?: string;
  is_active?: boolean;
}

export interface ExamGenerateRequest {
  code: string;
  title: string;
  subject: string;
  duration: number;
  total_questions: number;
  description?: string;
  shuffle_choices?: boolean;
}

export interface ExamQuestionDetail {
  id: number;
  question_id: number;
  question_order: number;
  content: string;
  content_img?: string;
  choices: string[]; // Shuffled choices
  choice_labels: string[]; // Corresponding labels (A, B, C, D)
  correct_answer_index: number; // Index of correct answer in shuffled choices
  mark: number;
  unit?: string;
}

export interface ExamDetailResponse extends Exam {
  questions: ExamQuestionDetail[];
  creator_username?: string;
}

export interface ExamListParams {
  page?: number;
  page_size?: number;
  subject?: string;
  created_by?: number;
}

export interface ExamStats {
  total_exams: number;
  active_exams: number;
  subjects: string[];
  avg_duration: number;
  avg_questions: number;
}
