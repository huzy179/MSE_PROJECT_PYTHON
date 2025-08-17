// Question types
export interface Question {
  id: number;
  code?: string;
  content: string;
  content_img?: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  answer: string;
  mark: number;
  unit?: string;
  mix: boolean;
  subject?: string;
  lecturer?: string;
  importer?: number;
  editor?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface QuestionCreate {
  code?: string;
  content: string;
  content_img?: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  answer: string;
  mark?: number;
  unit?: string;
  mix?: boolean;
  subject?: string;
  lecturer?: string;
}

export interface QuestionUpdate {
  code?: string;
  content?: string;
  content_img?: string;
  choiceA?: string;
  choiceB?: string;
  choiceC?: string;
  choiceD?: string;
  answer?: string;
  mark?: number;
  unit?: string;
  mix?: boolean;
  subject?: string;
  lecturer?: string;
}

export interface QuestionListParams {
  page?: number;
  size?: number;
  search?: string;
  subject?: string;
}

export interface QuestionListResponse {
  data: Question[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

export interface QuestionResponse {
  data: Question;
}

export interface SubjectsResponse {
  data: string[];
}

// Form validation types
export interface QuestionFormData {
  code: string;
  content: string;
  content_img: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  answer: string;
  mark: number;
  unit: string;
  mix: boolean;
  subject: string;
  lecturer: string;
}

export interface QuestionFormErrors {
  content?: string;
  choiceA?: string;
  choiceB?: string;
  choiceC?: string;
  choiceD?: string;
  answer?: string;
  mark?: string;
}
