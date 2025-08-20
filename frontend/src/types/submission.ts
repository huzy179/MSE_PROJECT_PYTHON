export interface Answer {
  questionId: number;
  selectedOption: string; // A, B, C, D
  isAnswered: boolean;
}

export interface SubmissionCreate {
  exam_schedule_id: number;
  answers: string; // JSON string of Answer[]
}

export interface SubmissionOut {
  id: number;
  student_id: number;
  exam_schedule_id: number;
  submitted_at: string;
  answers: string; // JSON string of Answer[]
  score?: number;
  is_late: boolean;
}

export interface ExamSession {
  examSchedule: any; // Will be typed based on exam_schedule type
  questions: any[]; // Will be typed based on question type
  timeRemaining: number; // in seconds
  answers: Answer[];
  isSubmitted: boolean;
  startTime: Date;
}

export interface ExamProgress {
  totalQuestions: number;
  answeredQuestions: number;
  currentQuestion: number;
  timeSpent: number; // in seconds
}

export interface ExamSubmissionResult {
  success: boolean;
  submissionId?: number;
  score?: number;
  message: string;
}
