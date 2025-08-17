import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import PublicRoute from '../guards/PublicRoute';
import ProtectedRoute from '../guards/ProtectedRoute';
import RoleGuard from '../guards/RoleGuard';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import { Users } from '../pages/Users';
import Import from '../pages/Import';
import { USER_ROLES } from '../constants/roles';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Home Route */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />

      {/* Public Routes - Authentication */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Import - only for admin and teacher */}
      <Route
        path="/import"
        element={
          <RoleGuard allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.IMPORTER]}>
            <MainLayout>
              <Import />
            </MainLayout>
          </RoleGuard>
        }
      />

      {/* Dashboard - all authenticated users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Users management - admin only */}
      <Route
        path="/users"
        element={
          <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
            <MainLayout>
              <Users />
            </MainLayout>
          </RoleGuard>
        }
      />

      {/* Admin routes - admin only */}
      <Route
        path="/admin"
        element={
          <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
            <MainLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
                <p>Chỉ admin mới có thể truy cập trang này.</p>
              </div>
            </MainLayout>
          </RoleGuard>
        }
      />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
