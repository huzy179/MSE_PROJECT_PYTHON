import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Loading from '../components/Loading';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
  requireAuth?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/dashboard',
  requireAuth = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <Loading fullScreen text="Đang kiểm tra quyền truy cập..." />;
  }

  // Nếu yêu cầu đăng nhập nhưng chưa đăng nhập
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập nhưng không có quyền truy cập
  if (isAuthenticated && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
