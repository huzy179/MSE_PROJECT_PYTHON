import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { Exam, ExamCreate, ExamUpdate } from '../types';

interface ExamFormProps {
  exam?: Exam;
  onSave: () => void;
  onCancel: () => void;
}

const ExamForm: React.FC<ExamFormProps> = ({ exam, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ExamCreate>({
    code: '',
    title: '',
    subject: '',
    duration: 60,
    total_questions: 10,
    description: '',
    is_active: true,
  });
  const [autoGenerateQuestions, setAutoGenerateQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    if (exam) {
      setFormData({
        code: exam.code,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        total_questions: exam.total_questions,
        description: exam.description || '',
        is_active: exam.is_active,
      });
    }
  }, [exam]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const subjectList = await apiService.getExamSubjects();
      setSubjects(subjectList);

      // Fetch available questions count for each subject
      const questionCounts: { [key: string]: number } = {};
      for (const subject of subjectList) {
        try {
          const response = await apiService.getQuestions({ subject, size: 1 });
          questionCounts[subject] = response.pagination.total;
        } catch (err) {
          questionCounts[subject] = 0;
        }
      }
      setAvailableQuestions(questionCounts);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseInt(value) || 0
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate if auto-generating questions
      if (autoGenerateQuestions && !exam) {
        const availableCount = availableQuestions[formData.subject] || 0;
        if (formData.total_questions > availableCount) {
          setError(
            `Không đủ câu hỏi cho môn ${formData.subject}. Chỉ có ${availableCount} câu hỏi có sẵn.`
          );
          setLoading(false);
          return;
        }
      }

      if (exam) {
        // Update existing exam
        const updateData: ExamUpdate = { ...formData };
        await apiService.updateExam(exam.id, updateData);
      } else {
        // Create new exam
        if (autoGenerateQuestions) {
          // Use generate API to create exam with questions
          const generateRequest = {
            ...formData,
            shuffle_choices: true,
          };
          await apiService.generateExam(generateRequest);
        } else {
          // Create empty exam
          await apiService.createExam(formData);
        }
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi lưu đề thi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {exam ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
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
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mã đề thi *
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mã đề thi"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Môn học *
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn môn học</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tiêu đề đề thi *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập tiêu đề đề thi"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Thời gian thi (phút) *
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="60"
            />
          </div>

          <div>
            <label
              htmlFor="total_questions"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Số câu hỏi *
            </label>
            <input
              type="number"
              id="total_questions"
              name="total_questions"
              value={formData.total_questions}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập mô tả đề thi (tùy chọn)"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_active"
              className="ml-2 block text-sm text-gray-900"
            >
              Đề thi hoạt động
            </label>
          </div>

          {!exam && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_generate_questions"
                checked={autoGenerateQuestions}
                onChange={(e) => setAutoGenerateQuestions(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="auto_generate_questions"
                className="ml-2 block text-sm text-gray-900"
              >
                Tự động thêm câu hỏi từ ngân hàng câu hỏi
              </label>
            </div>
          )}

          {autoGenerateQuestions && !exam && (
            <div className="ml-6 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Hệ thống sẽ tự động chọn ngẫu nhiên{' '}
                    <strong>{formData.total_questions} câu hỏi</strong> từ môn{' '}
                    <strong>{formData.subject || '[Chưa chọn]'}</strong> và xáo
                    trộn thứ tự câu trả lời.
                    {formData.subject && (
                      <span className="block mt-1">
                        Có sẵn:{' '}
                        <strong>
                          {availableQuestions[formData.subject] || 0}
                        </strong>{' '}
                        câu hỏi cho môn {formData.subject}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? autoGenerateQuestions && !exam
                ? 'Đang sinh đề thi...'
                : 'Đang lưu...'
              : exam
                ? 'Cập nhật'
                : autoGenerateQuestions
                  ? 'Tạo đề thi + Câu hỏi'
                  : 'Tạo đề thi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamForm;
