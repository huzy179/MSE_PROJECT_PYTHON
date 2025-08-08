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

      // Tạo user object mẫu (trong thực tế sẽ lấy từ API)
      const userData = {
        id: 1,
        username: data.username,
        created_at: new Date().toISOString(),
      };

      contextLogin(response.access_token, userData);
      navigate('/dashboard');
      return response;
    } catch (err) {
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
