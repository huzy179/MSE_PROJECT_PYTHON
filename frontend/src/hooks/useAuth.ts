import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { LoginRequest, RegisterRequest } from '../types';

interface AxiosError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    login: contextLogin,
    logout: contextLogout,
    user,
    isAuthenticated,
  } = useAuthContext();

  const login = async (data: LoginRequest) => {
    try {
      console.log('🔵 Starting login process...');
      setIsLoading(true);
      setError(null);

      console.log('🔵 Calling apiService.login...');
      const response = await apiService.login(data);
      console.log('🔵 Login response received:', response);

      // Gọi contextLogin để lưu token và fetch user data
      console.log('🔵 Calling contextLogin...');
      await contextLogin(response.access_token, response.refresh_token);
      console.log('🔵 contextLogin completed');

      // Thêm delay nhỏ để đảm bảo state được update
      console.log('🔵 Waiting for state update...');
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('🔵 Navigating to dashboard...');
      navigate('/dashboard');
      console.log('🔵 Login process completed successfully');
      return response;
    } catch (err) {
      console.error('🔴 Login error:', err);
      console.error('🔴 Error stack:', err instanceof Error ? err.stack : 'No stack');
      const axiosError = err as AxiosError;
      const errorMessage =
        axiosError.response?.data?.detail || 'Đăng nhập thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.register(data);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage =
        axiosError.response?.data?.detail || 'Đăng ký thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    contextLogout();
    navigate('/login');
  };

  return {
    login,
    register,
    logout,
    isAuthenticated,
    user,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
