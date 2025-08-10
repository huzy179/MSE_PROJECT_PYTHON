import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { getUserIdFromToken, isTokenExpired } from '../utils/jwt';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (access_token: string, refresh_token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra token khi app khởi động và fetch user từ API
  useEffect(() => {
    const initializeAuth = async () => {
      const access_token = localStorage.getItem('access_token');

      if (access_token && !isTokenExpired(access_token)) {
        try {
          logger.log('🟡 Initializing auth with token...');
          // Lấy user ID từ token
          const userId = getUserIdFromToken(access_token);
          if (userId) {
            logger.log('🟡 Found user ID in token:', userId);
            // Fetch user data từ API
            const userData = await apiService.getUserById(userId);
            logger.log('🟡 Fetched user data:', userData);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            logger.log('🔴 No user ID found in token');
            throw new Error('No user ID in token');
          }
        } catch (error) {
          logger.error('🔴 Error initializing auth:', error);
          // Nếu có lỗi, xóa token và user data
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        logger.log('🟡 No valid token found');
        // Token hết hạn hoặc không tồn tại
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (access_token: string, refresh_token: string) => {
    logger.log('🟡 AuthContext login started');
    logger.log('🟡 Access token:', access_token?.substring(0, 20) + '...');

    try {
      // Lưu token
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      logger.log('🟡 Tokens saved to localStorage');

      // Lấy user ID từ token và fetch user data từ API
      const userId = getUserIdFromToken(access_token);
      if (userId) {
        logger.log('🟡 Found user ID in token:', userId);
        // Fetch user data từ API để có thông tin đầy đủ và mới nhất
        const fullUserData = await apiService.getUserById(userId);
        logger.log('🟡 Fetched full user data:', fullUserData);
        setUser(fullUserData);
        localStorage.setItem('user', JSON.stringify(fullUserData));
        logger.log('🟡 User set successfully from API');
      } else {
        logger.log('🔴 No user ID found in token');
        throw new Error('No user ID found in token');
      }
    } catch (error) {
      logger.error('🔴 Error in login:', error);
      throw error;
    }
    logger.log('🟡 AuthContext login completed');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = !!user && !!localStorage.getItem('access_token');

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [user, isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
