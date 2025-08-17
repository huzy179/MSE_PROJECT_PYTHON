import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';
import type {
  Question,
  QuestionFormData,
  QuestionFormErrors,
  QuestionUpdate,
  QuestionCreate,
} from '../types';

interface QuestionFormProps {
  question?: Question;
  onSave: () => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    code: '',
    content: '',
    content_img: '',
    choiceA: '',
    choiceB: '',
    choiceC: '',
    choiceD: '',
    answer: 'A',
    mark: 1,
    unit: '',
    mix: false,
    subject: '',
    lecturer: '',
  });

  const [errors, setErrors] = useState<QuestionFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (question) {
      setFormData({
        code: question.code || '',
        content: question.content,
        content_img: question.content_img || '',
        choiceA: question.choiceA,
        choiceB: question.choiceB,
        choiceC: question.choiceC,
        choiceD: question.choiceD,
        answer: question.answer,
        mark: question.mark,
        unit: question.unit || '',
        mix: question.mix,
        subject: question.subject || '',
        lecturer: question.lecturer || '',
      });
    }
  }, [question]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const subjectList = await apiService.getSubjects();
      setSubjects(subjectList);
    } catch (err) {
      logger.error('Error fetching subjects:', err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: QuestionFormErrors = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung câu hỏi là bắt buộc';
    }

    if (!formData.choiceA.trim()) {
      newErrors.choiceA = 'Lựa chọn A là bắt buộc';
    }

    if (!formData.choiceB.trim()) {
      newErrors.choiceB = 'Lựa chọn B là bắt buộc';
    }

    if (!formData.choiceC.trim()) {
      newErrors.choiceC = 'Lựa chọn C là bắt buộc';
    }

    if (!formData.choiceD.trim()) {
      newErrors.choiceD = 'Lựa chọn D là bắt buộc';
    }

    if (!['A', 'B', 'C', 'D'].includes(formData.answer)) {
      newErrors.answer = 'Đáp án phải là A, B, C hoặc D';
    }

    if (formData.mark <= 0) {
      newErrors.mark = 'Điểm phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (question) {
        // Update existing question
        const updateData: QuestionUpdate = {
          code: formData.code || undefined,
          content: formData.content,
          content_img: formData.content_img || undefined,
          choiceA: formData.choiceA,
          choiceB: formData.choiceB,
          choiceC: formData.choiceC,
          choiceD: formData.choiceD,
          answer: formData.answer,
          mark: formData.mark,
          unit: formData.unit || undefined,
          mix: formData.mix,
          subject: formData.subject || undefined,
          lecturer: formData.lecturer || undefined,
        };
        await apiService.updateQuestion(question.id, updateData);
      } else {
        // Create new question
        const createData: QuestionCreate = {
          code: formData.code || undefined,
          content: formData.content,
          content_img: formData.content_img || undefined,
          choiceA: formData.choiceA,
          choiceB: formData.choiceB,
          choiceC: formData.choiceC,
          choiceD: formData.choiceD,
          answer: formData.answer,
          mark: formData.mark,
          unit: formData.unit || undefined,
          mix: formData.mix,
          subject: formData.subject || undefined,
          lecturer: formData.lecturer || undefined,
        };
        await apiService.createQuestion(createData);
      }
      onSave();
    } catch (err) {
      logger.error('Error saving question:', err);
      alert('Không thể lưu câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof QuestionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof QuestionFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        {question ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã câu hỏi
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Q001"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Môn học
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              list="subjects"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Toán học"
            />
            <datalist id="subjects">
              {subjects.map((subject) => (
                <option key={subject} value={subject} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung câu hỏi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập nội dung câu hỏi..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* Content Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh (URL hoặc tên file)
          </label>
          <input
            type="text"
            value={formData.content_img}
            onChange={(e) => handleInputChange('content_img', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: image.png"
          />
        </div>

        {/* Choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['A', 'B', 'C', 'D'] as const).map((choice) => (
            <div key={choice}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lựa chọn {choice} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={
                  formData[
                    `choice${choice}` as keyof QuestionFormData
                  ] as string
                }
                onChange={(e) =>
                  handleInputChange(
                    `choice${choice}` as keyof QuestionFormData,
                    e.target.value
                  )
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`choice${choice}` as keyof QuestionFormErrors]
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder={`Nhập lựa chọn ${choice}...`}
              />
              {errors[`choice${choice}` as keyof QuestionFormErrors] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors[`choice${choice}` as keyof QuestionFormErrors]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đáp án đúng <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.answer}
              onChange={(e) => handleInputChange('answer', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.answer ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
            {errors.answer && (
              <p className="mt-1 text-sm text-red-600">{errors.answer}</p>
            )}
          </div>

          {/* Mark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={formData.mark}
              onChange={(e) =>
                handleInputChange('mark', parseFloat(e.target.value) || 0)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mark ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.mark && (
              <p className="mt-1 text-sm text-red-600">{errors.mark}</p>
            )}
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn vị
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Chương 1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lecturer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giảng viên
            </label>
            <input
              type="text"
              value={formData.lecturer}
              onChange={(e) => handleInputChange('lecturer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tên giảng viên"
            />
          </div>

          {/* Mix */}
          <div className="flex items-center pt-8">
            <input
              type="checkbox"
              id="mix"
              checked={formData.mix}
              onChange={(e) => handleInputChange('mix', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="mix" className="ml-2 block text-sm text-gray-700">
              Trộn lựa chọn
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang lưu...' : question ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
