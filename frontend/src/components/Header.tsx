import React from 'react';
import { Link } from 'react-router-dom';
import { config } from '../config/env';
import { USER_ROLES } from '../constants/roles';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-800">
              {config.appTitle}
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {/* User info */}
                {user && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:inline">
                      Xin chào, {user.username}
                    </span>
                  </div>
                )}

                {/* Navigation links based on role */}
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Dashboard
                </Link>

                {/* Questions management - for admin and teacher */}
                {user &&
                  (user.role === USER_ROLES.ADMIN ||
                    user.role === USER_ROLES.TEACHER) && (
                    <Link
                      to="/questions"
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                    >
                      Câu hỏi
                    </Link>
                  )}

                {/* Exams management - for admin and teacher */}
                {user &&
                  (user.role === USER_ROLES.ADMIN ||
                    user.role === USER_ROLES.TEACHER) && (
                    <Link
                      to="/exams"
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                    >
                      Đề thi
                    </Link>
                  )}
                {user &&
                  (user.role === USER_ROLES.ADMIN ||
                    user.role === USER_ROLES.TEACHER) && (
                    <Link
                      to="/exam_schedules"
                      className="px-3 py-2 rounded hover:bg-blue-100 text-blue-700 font-medium"
                    >
                      Lịch thi
                    </Link>
                  )}
                {/* Users management - admin only */}
                {user && user.role === USER_ROLES.ADMIN && (
                  <Link
                    to="/users"
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    Người dùng
                  </Link>
                )}

                {/* Admin panel - admin only */}
                {user && user.role === USER_ROLES.ADMIN && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    Admin
                  </Link>
                )}

                {/* Role badge */}
                {user && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === USER_ROLES.ADMIN
                        ? 'bg-red-100 text-red-800'
                        : user.role === USER_ROLES.TEACHER
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                )}

                {/* Logout button */}
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
