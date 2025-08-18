// frontend/src/api.ts
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { config } from '../config/env';
import type {
  AuthResponse,
  Exam,
  ExamCreate,
  ExamDetailResponse,
  ExamGenerateRequest,
  ExamListParams,
  ExamUpdate,
  LoginRequest,
  Question,
  QuestionCreate,
  QuestionListParams,
  QuestionListResponse,
  QuestionResponse,
  QuestionUpdate,
  RegisterRequest,
  SubjectsResponse,
  User,
  UserListParams,
  UserListResponse,
} from '../types';
import { logger } from '../utils/logger';

class ApiService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        const access_token = localStorage.getItem('access_token');
        logger.log(
          '🟠 API Request interceptor - token:',
          access_token?.substring(0, 20) + '...'
        );
        if (access_token) {
          config.headers.Authorization = `Bearer ${access_token}`;
          logger.log('🟠 API Request interceptor - Authorization header set');
        } else {
          logger.log('🔴 API Request interceptor - No token found');
        }
        logger.log('🟠 API Request interceptor - URL:', config.url);
        return config;
      },
      (error) => {
        logger.error('🔴 API Request interceptor error:', error);
        return Promise.reject(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    );
  }

  // Auth methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<void> {
    await this.api.post('/auth/register', data);
  }

  // User management methods
  async getUsers(params?: UserListParams): Promise<UserListResponse> {
    const response = await this.api.get<UserListResponse>('/users', { params });
    return response.data;
  }

  async getUserById(userId: number): Promise<User> {
    logger.log('🟠 API: Getting user by ID:', userId);
    try {
      const response = await this.api.get<{ data: User }>(`/users/${userId}`);
      logger.log('🟠 API: getUserById response:', response);
      logger.log('🟠 API: getUserById response.data:', response.data);
      logger.log('🟠 API: getUserById user data:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('🔴 API: Error getting user by ID:', error);
      throw error;
    }
  }

  async restoreUser(userId: number): Promise<void> {
    await this.api.patch(`/users/${userId}/restore`);
  }

  async softDeleteUser(userId: number): Promise<void> {
    await this.api.delete(`/users/${userId}`);
  }

  async getDeletedUsers(params: UserListParams): Promise<UserListResponse> {
    const response = await this.api.get<UserListResponse>('/users/deleted', {
      params,
    });
    return response.data;
  }

  // Question management methods
  async getQuestions(
    params?: QuestionListParams
  ): Promise<QuestionListResponse> {
    const response = await this.api.get<QuestionListResponse>('/questions', {
      params,
    });
    return response.data;
  }

  async getQuestionById(questionId: number): Promise<Question> {
    const response = await this.api.get<QuestionResponse>(
      `/questions/${questionId}`
    );
    return response.data.data;
  }

  async createQuestion(question: QuestionCreate): Promise<Question> {
    const response = await this.api.post<QuestionResponse>(
      '/questions',
      question
    );
    return response.data.data;
  }

  async updateQuestion(
    questionId: number,
    question: QuestionUpdate
  ): Promise<Question> {
    const response = await this.api.put<QuestionResponse>(
      `/questions/${questionId}`,
      question
    );
    return response.data.data;
  }

  async deleteQuestion(questionId: number): Promise<void> {
    await this.api.delete(`/questions/${questionId}`);
  }

  async getSubjects(): Promise<string[]> {
    const response = await this.api.get<SubjectsResponse>(
      '/questions/subjects/list'
    );
    return response.data.data;
  }

  async importQuestions(file: File, user: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', JSON.stringify(user));

    const response = await this.api.post('/questions/import_file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Exam methods
  async getExams(params?: ExamListParams): Promise<UserListResponse<Exam>> {
    const response = await this.api.get('/exams', { params });
    return response.data;
  }

  async getExamById(id: number): Promise<ExamDetailResponse> {
    const response = await this.api.get(`/exams/${id}`);
    return response.data;
  }

  async createExam(exam: ExamCreate): Promise<Exam> {
    const response = await this.api.post('/exams', exam);
    return response.data;
  }

  async generateExam(examRequest: ExamGenerateRequest): Promise<Exam> {
    const response = await this.api.post('/exams/generate', examRequest);
    return response.data;
  }

  async updateExam(id: number, exam: ExamUpdate): Promise<Exam> {
    const response = await this.api.put(`/exams/${id}`, exam);
    return response.data;
  }

  async deleteExam(id: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/exams/${id}`);
    return response.data;
  }

  async restoreExam(id: number): Promise<{ message: string }> {
    const response = await this.api.post(`/exams/${id}/restore`);
    return response.data;
  }

  async getExamSubjects(): Promise<string[]> {
    const response = await this.api.get('/exams/subjects');
    return response.data;
  }

  // Generic methods for future use
  get instance() {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.instance;
