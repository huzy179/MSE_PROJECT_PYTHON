import React, { useState } from "react";
import type { ExamSchedule, ExamScheduleCreate, ExamScheduleUpdate } from "../types/exam_schedule";
import { apiService } from "../services/api";
import { useAuth } from "../hooks/useAuth"; // Thêm dòng này

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
  const { user } = useAuth(); // Lấy user hiện tại
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
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
        // Thêm created_by từ user hiện tại
        await apiService.createExamSchedule({
          ...(form as ExamScheduleCreate),
          // created_by: user?.id,
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
      {/* ...Các trường khác giữ nguyên... */}
      {/* Bỏ trường nhập created_by */}
      {/* ... */}
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