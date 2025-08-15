// frontend/src/api.ts
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UserListParams,
  UserListResponse,
} from '../types';
import { config } from '../config/env';
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
        logger.log('🟠 API Request interceptor - token:', access_token?.substring(0, 20) + '...');
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
    const response = await this.api.post<AuthResponse>('/v1/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<void> {
    await this.api.post('/v1/auth/register', data);
  }

  // User management methods
  async getUsers(params?: UserListParams): Promise<UserListResponse> {
    const response = await this.api.get<UserListResponse>('/v1/users', { params });
    return response.data;
  }

  async getUserById(userId: number): Promise<User> {
    logger.log('🟠 API: Getting user by ID:', userId);
    try {
      const response = await this.api.get<{data: User}>(`/v1/users/${userId}`);
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
    await this.api.patch(`/v1/users/${userId}/restore`);
  }

  async softDeleteUser(userId: number): Promise<void> {
    await this.api.delete(`/v1/users/${userId}`);
  }

  async getDeletedUsers(params: UserListParams): Promise<UserListResponse> {
    const response = await this.api.get<UserListResponse>('/v1/users/deleted', { params });
    return response.data;
  }

  // Generic methods for future use
  get instance() {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.instance;
