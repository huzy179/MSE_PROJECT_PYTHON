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
      setIsLoading(true);
      setError(null);

      const response = await apiService.login(data);

      // Gọi contextLogin để lưu token và fetch user data
      await contextLogin(response.access_token, response.refresh_token);

      // Thêm delay nhỏ để đảm bảo state được update
      await new Promise((resolve) => setTimeout(resolve, 100));

      navigate('/dashboard');
      return response;
    } catch (err) {
      console.error('🔴 Login error:', err);
      console.error(
        '🔴 Error stack:',
        err instanceof Error ? err.stack : 'No stack'
      );
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
