import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { ExamGenerateRequest } from '../types';

interface ExamGeneratorProps {
  onGenerate: () => void;
  onCancel: () => void;
}

const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  onGenerate,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ExamGenerateRequest>({
    code: '',
    title: '',
    subject: '',
    duration: 60,
    total_questions: 10,
    description: '',
    shuffle_choices: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<{
    [key: string]: number;
  }>({});

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

    // Validate if enough questions are available
    const availableCount = availableQuestions[formData.subject] || 0;
    if (formData.total_questions > availableCount) {
      setError(
        `Không đủ câu hỏi cho môn ${formData.subject}. Chỉ có ${availableCount} câu hỏi có sẵn.`
      );
      setLoading(false);
      return;
    }

    try {
      await apiService.generateExam(formData);
      onGenerate();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi sinh đề thi');
    } finally {
      setLoading(false);
    }
  };

  const selectedSubjectQuestions = availableQuestions[formData.subject] || 0;
  const isValidQuestionCount =
    formData.total_questions <= selectedSubjectQuestions;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Sinh đề thi tự động
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

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
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
            <h3 className="text-sm font-medium text-blue-800">Thông tin</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Hệ thống sẽ tự động chọn ngẫu nhiên câu hỏi từ ngân hàng câu hỏi
                theo môn học đã chọn.
              </p>
              <p>
                Thứ tự các lựa chọn A, B, C, D sẽ được xáo trộn ngẫu nhiên cho
                mỗi câu hỏi.
              </p>
            </div>
          </div>
        </div>
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
                  {subject} ({availableQuestions[subject] || 0} câu hỏi có sẵn)
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
              max={selectedSubjectQuestions}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isValidQuestionCount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="10"
            />
            {formData.subject && (
              <p
                className={`mt-1 text-sm ${isValidQuestionCount ? 'text-gray-500' : 'text-red-600'}`}
              >
                Có sẵn: {selectedSubjectQuestions} câu hỏi cho môn{' '}
                {formData.subject}
              </p>
            )}
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="shuffle_choices"
            name="shuffle_choices"
            checked={formData.shuffle_choices}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="shuffle_choices"
            className="ml-2 block text-sm text-gray-900"
          >
            Xáo trộn thứ tự câu trả lời (A, B, C, D)
          </label>
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
            disabled={loading || !isValidQuestionCount}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang sinh đề thi...' : 'Sinh đề thi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamGenerator;
