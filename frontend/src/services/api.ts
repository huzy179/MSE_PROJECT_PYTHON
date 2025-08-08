// frontend/src/api.ts
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';

class ApiService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
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
          localStorage.removeItem('token');
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
    console.log('Sending login request with data:', data);
    const response = await this.api.post<AuthResponse>('/v1/auth/login', data);
    console.log('Login response:', response.data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<void> {
    await this.api.post('/v1/auth/register', data);
  }

  // Generic methods for future use
  get instance() {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.instance;
