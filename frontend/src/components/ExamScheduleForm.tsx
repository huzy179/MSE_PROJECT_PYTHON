import React, { useState, useEffect } from 'react';
import type {
  ExamSchedule,
  ExamScheduleCreate,
  ExamScheduleUpdate,
} from '../types/exam_schedule';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Exam } from '../types/exam';

interface Props {
  initialData?: ExamSchedule;
  onSuccess?: () => void;
}

const defaultForm: Omit<ExamScheduleCreate, 'created_by'> = {
  title: '',
  description: '',
  exam_id: 1,
  start_time: '',
  end_time: '',
  max_attempts: 1,
  is_active: true,
};

const ExamScheduleForm: React.FC<Props> = ({ initialData, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<ExamScheduleCreate | ExamScheduleUpdate>(
    initialData
      ? {
          ...initialData,
          start_time: initialData.start_time?.slice(0, 16) ?? '',
          end_time: initialData.end_time?.slice(0, 16) ?? '',
        }
      : { ...defaultForm }
  );
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await apiService.getExams();
        setExams(res.data ?? []);
      } catch {
        setExams([]);
      }
    };
    fetchExams();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (target as HTMLInputElement).checked
          : type === 'number'
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await apiService.updateExamSchedule(
          initialData.id,
          form as ExamScheduleUpdate
        );
      } else {
        if (!user?.id) {
          alert('Không xác định được người dùng đăng nhập.');
          setLoading(false);
          return;
        }
        await apiService.createExamSchedule({
          ...(form as ExamScheduleCreate),
          created_by: user.id,
        });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      alert('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gray-50 p-6 rounded-lg shadow"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          value={form.title ?? ''}
          onChange={handleChange}
          required
          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          placeholder="Nhập tiêu đề"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mô tả
        </label>
        <textarea
          name="description"
          value={form.description ?? ''}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          placeholder="Nhập mô tả"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kỳ thi <span className="text-red-500">*</span>
        </label>
        <select
          name="exam_id"
          value={form.exam_id ?? ''}
          onChange={handleChange}
          required
          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">-- Chọn kỳ thi --</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bắt đầu <span className="text-red-500">*</span>
          </label>
          <input
            name="start_time"
            type="datetime-local"
            value={form.start_time ?? ''}
            onChange={handleChange}
            required
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kết thúc <span className="text-red-500">*</span>
          </label>
          <input
            name="end_time"
            type="datetime-local"
            value={form.end_time ?? ''}
            onChange={handleChange}
            required
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Số lần làm tối đa <span className="text-red-500">*</span>
        </label>
        <input
          name="max_attempts"
          type="number"
          value={form.max_attempts ?? ''}
          onChange={handleChange}
          required
          min={1}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input
            name="is_active"
            type="checkbox"
            checked={!!form.is_active}
            onChange={handleChange}
            className="rounded border-gray-300 focus:ring-blue-500"
          />
          Đang hoạt động
        </label>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
        >
          {initialData ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default ExamScheduleForm;
