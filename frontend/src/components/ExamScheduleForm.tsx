import React, { useState, useEffect } from "react";
import type { ExamSchedule, ExamScheduleCreate, ExamScheduleUpdate } from "../types/exam_schedule";
import { apiService } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { Exam } from "../types/exam";

interface Props {
  initialData?: ExamSchedule;
  onSuccess?: () => void;
}

const defaultForm: Omit<ExamScheduleCreate, "created_by"> = {
  title: "",
  description: "",
  exam_id: 1,
  start_time: "",
  end_time: "",
  max_attempts: 1,
  is_active: true,
};

const ExamScheduleForm: React.FC<Props> = ({ initialData, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<ExamScheduleCreate | ExamScheduleUpdate>(
    initialData
      ? {
          ...initialData,
          start_time: initialData.start_time?.slice(0, 16) ?? "",
          end_time: initialData.end_time?.slice(0, 16) ?? "",
        }
      : { ...defaultForm }
  );
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await apiService.getExams();
        // Nếu API trả về res.data là mảng exam
        setExams(res.data ?? []);
      } catch {
        setExams([]);
      }
    };
    fetchExams();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await apiService.updateExamSchedule(initialData.id, form as ExamScheduleUpdate);
      } else {
        if (!user?.id) {
          alert("Không xác định được người dùng đăng nhập.");
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
      alert("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Tiêu đề *</label>
        <input
          name="title"
          value={form.title ?? ""}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Nhập tiêu đề"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Mô tả</label>
        <textarea
          name="description"
          value={form.description ?? ""}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Nhập mô tả"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Kì thi *</label>
        <select
          name="exam_id"
          value={form.exam_id ?? ""}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        >
          <option value="">-- Chọn kỳ thi --</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium mb-1">Bắt đầu *</label>
          <input
            name="start_time"
            type="datetime-local"
            value={form.start_time ?? ""}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Kết thúc *</label>
          <input
            name="end_time"
            type="datetime-local"
            value={form.end_time ?? ""}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Số lần làm tối đa *</label>
        <input
          name="max_attempts"
          type="number"
          value={form.max_attempts ?? ""}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          min={1}
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            name="is_active"
            type="checkbox"
            checked={!!form.is_active}
            onChange={handleChange}
          />
          Đang hoạt động
        </label>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {initialData ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
};

export default ExamScheduleForm;