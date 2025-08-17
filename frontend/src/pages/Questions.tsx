import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Question } from '../types';
import QuestionList from '../components/QuestionList';
import QuestionForm from '../components/QuestionForm';
import QuestionImport from '../components/QuestionImport';
import { USER_ROLES } from '../constants/roles';

type ViewMode = 'list' | 'form' | 'import';

const Questions: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(
    undefined
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if user has permission to access this page
  if (
    !user ||
    (user.role !== USER_ROLES.TEACHER && user.role !== USER_ROLES.ADMIN)
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600">
            Chỉ giảng viên và quản trị viên mới có thể truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setViewMode('form');
  };

  const handleDelete = () => {
    // Delete is handled in QuestionList component
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSave = () => {
    setViewMode('list');
    setEditingQuestion(undefined);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingQuestion(undefined);
  };

  const handleAddNew = () => {
    setEditingQuestion(undefined);
    setViewMode('form');
  };

  const handleImport = () => {
    setViewMode('import');
  };

  const handleImportSuccess = () => {
    setViewMode('list');
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý câu hỏi
              </h1>
              <p className="text-gray-600 mt-2">
                Tạo, chỉnh sửa và quản lý ngân hàng câu hỏi
              </p>
            </div>
            {viewMode === 'list' && (
              <div className="flex space-x-3">
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Thêm câu hỏi</span>
                </button>

                <button
                  onClick={handleImport}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <span>Import từ file</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'form' ? (
          <div className="space-y-6">
            {/* Back button */}
            <div>
              <button
                onClick={handleCancel}
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Quay lại danh sách</span>
              </button>
            </div>

            {/* Form */}
            <QuestionForm
              question={editingQuestion}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        ) : viewMode === 'import' ? (
          <div className="space-y-6">
            {/* Back button */}
            <div>
              <button
                onClick={handleCancel}
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Quay lại danh sách</span>
              </button>
            </div>

            {/* Import */}
            <QuestionImport
              onImportSuccess={handleImportSuccess}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <QuestionList
            onEdit={handleEdit}
            onDelete={handleDelete}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>
    </div>
  );
};

export default Questions;
