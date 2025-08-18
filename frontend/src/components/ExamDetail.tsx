import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { ExamDetailResponse } from '../types';

interface ExamDetailProps {
  examId: number;
  onBack: () => void;
  onEdit: () => void;
}

const ExamDetail: React.FC<ExamDetailProps> = ({ examId, onBack, onEdit }) => {
  const [exam, setExam] = useState<ExamDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExamDetail();
  }, [examId]);

  const fetchExamDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const examData = await apiService.getExamById(examId);
      setExam(examData);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Có lỗi xảy ra khi tải chi tiết đề thi'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} giờ ${mins} phút`;
    }
    return `${mins} phút`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy đề thi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-sm text-gray-600 mt-1">Mã đề thi: {exam.code}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Quay lại
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Môn học</div>
            <div className="text-lg font-semibold text-gray-900">
              {exam.subject}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500">
              Thời gian thi
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatDuration(exam.duration)}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Số câu hỏi</div>
            <div className="text-lg font-semibold text-gray-900">
              {exam.total_questions}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Trạng thái</div>
            <div className="text-lg font-semibold">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  exam.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {exam.is_active ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
          </div>
        </div>

        {exam.description && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-500 mb-2">Mô tả</div>
            <p className="text-gray-900">{exam.description}</p>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Được tạo bởi: {exam.creator_username || 'N/A'} vào{' '}
          {new Date(exam.created_at).toLocaleString('vi-VN')}
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Danh sách câu hỏi ({exam.questions.length})
        </h2>

        {exam.questions.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Chưa có câu hỏi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Đề thi này chưa có câu hỏi nào.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {exam.questions.map((question, index) => (
              <div
                key={question.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Câu {question.question_order}: {question.content}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {question.mark} điểm
                    {question.unit && ` (${question.unit})`}
                  </div>
                </div>

                {question.content_img && (
                  <div className="mb-3">
                    <img
                      src={question.content_img}
                      alt="Question image"
                      className="max-w-full h-auto rounded-md"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {question.choices.map((choice, choiceIndex) => (
                    <div
                      key={choiceIndex}
                      className={`p-3 rounded-md border ${
                        choiceIndex === question.correct_answer_index
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="font-medium mr-2">
                          {question.choice_labels[choiceIndex]}.
                        </span>
                        <span>{choice}</span>
                        {choiceIndex === question.correct_answer_index && (
                          <svg
                            className="w-4 h-4 ml-2 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDetail;
