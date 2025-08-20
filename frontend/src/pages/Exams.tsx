import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Exam } from '../types';
import ExamList from '../components/ExamList';
import ExamForm from '../components/ExamForm';
import ExamDetail from '../components/ExamDetail';
import ExamGenerator from '../components/ExamGenerator';
import { USER_ROLES } from '../constants/roles';
import { Link } from 'react-router-dom';

type ViewMode = 'list' | 'form' | 'detail' | 'generate';

const Exams: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingExam, setEditingExam] = useState<Exam | undefined>(undefined);
  const [viewingExamId, setViewingExamId] = useState<number | undefined>(
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
            Chỉ giáo viên và quản trị viên mới có thể truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  // const handleCreateExam = () => {
  //   setEditingExam(undefined);
  //   setViewMode('form');
  // };

  const handleGenerateExam = () => {
    setViewMode('generate');
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setViewMode('form');
  };

  const handleViewExam = (exam: Exam) => {
    setViewingExamId(exam.id);
    setViewMode('detail');
  };

  const handleSaveExam = () => {
    setViewMode('list');
    setEditingExam(undefined);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancelForm = () => {
    setViewMode('list');
    setEditingExam(undefined);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setViewingExamId(undefined);
  };

  const handleEditFromDetail = () => {
    if (viewingExamId) {
      // We need to fetch the exam data for editing
      // For now, we'll just switch to form mode and let the form handle it
      setViewMode('form');
    }
  };

  const handleGenerateSuccess = () => {
    setViewMode('list');
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancelGenerate = () => {
    setViewMode('list');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'form':
        return (
          <ExamForm
            exam={editingExam}
            onSave={handleSaveExam}
            onCancel={handleCancelForm}
          />
        );
      case 'detail':
        return viewingExamId ? (
          <ExamDetail
            examId={viewingExamId}
            onBack={handleBackToList}
            onEdit={handleEditFromDetail}
          />
        ) : null;
      case 'generate':
        return (
          <ExamGenerator
            onGenerate={handleGenerateSuccess}
            onCancel={handleCancelGenerate}
          />
        );
      case 'list':
      default:
        return (
          <ExamList
            onEditExam={handleEditExam}
            onViewExam={handleViewExam}
            refreshTrigger={refreshTrigger}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {viewMode === 'list' && (
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý đề thi
                </h1>
                <p className="mt-2 text-gray-600">
                  Tạo và quản lý đề thi cho các môn học
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleGenerateExam}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Sinh đề thi tự động
                </button>
                <Link
                  to="/exam_schedules"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Tạo lịch thi
                </Link>
                {/* <button
                  onClick={handleCreateExam}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Tạo đề thi mới
                </button> */}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Exams;
