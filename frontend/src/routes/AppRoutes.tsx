import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { USER_ROLES } from '../constants/roles';
import ProtectedRoute from '../guards/ProtectedRoute';
import PublicRoute from '../guards/PublicRoute';
import RoleGuard from '../guards/RoleGuard';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Exams from '../pages/Exams';
import ExamScheduleList from '../pages/ExamScheduleList';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Questions from '../pages/Questions';
import Register from '../pages/Register';
import StudentExam from '../pages/StudentExam';

import { Users } from '../pages/Users';

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

      {/* Questions management - teacher and admin only */}
      <Route
        path="/questions"
        element={
          <RoleGuard allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.TEACHER]}>
            <MainLayout>
              <Questions />
            </MainLayout>
          </RoleGuard>
        }
      />

      {/* Exams management - teacher and admin only */}
      <Route
        path="/exams"
        element={
          <RoleGuard allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.TEACHER]}>
            <MainLayout>
              <Exams />
            </MainLayout>
          </RoleGuard>
        }
      />

      {/* Exam Schedule management - teacher and admin only */}
      <Route
        path="/exam_schedules"
        element={
          <RoleGuard allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.TEACHER]}>
            <MainLayout>
              <ExamScheduleList />
            </MainLayout>
          </RoleGuard>
        }
      />

      {/* Student Exam Taking - students only */}
      <Route
        path="/exam/:examScheduleId"
        element={
          <RoleGuard allowedRoles={[USER_ROLES.STUDENT]}>
            <StudentExam />
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
