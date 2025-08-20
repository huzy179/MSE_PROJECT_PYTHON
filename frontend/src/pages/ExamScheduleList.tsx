import React, { useEffect, useState } from "react";
import type { ExamSchedule } from "../types/exam_schedule";
import { apiService } from "../services/api";
import ExamScheduleForm from "../components/ExamScheduleForm";

const ExamScheduleList: React.FC = () => {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [editing, setEditing] = useState<ExamSchedule | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSchedules = async () => {
    const res = await apiService.getExamSchedules({ page: 1, size: 10 });
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleEdit = (schedule: ExamSchedule | null) => {
    setEditing(schedule);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditing(null);
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Danh sách lịch thi</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => handleEdit(null)}
        >
          + Tạo mới
        </button>
      </div>
      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Tiêu đề</th>
              <th className="py-2 px-4 text-left">Exam ID</th>
              <th className="py-2 px-4 text-left">Bắt đầu</th>
              <th className="py-2 px-4 text-left">Kết thúc</th>
              <th className="py-2 px-4 text-center">Hoạt động</th>
              <th className="py-2 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{s.id}</td>
                <td className="py-2 px-4">{s.title}</td>
                <td className="py-2 px-4">{s.exam_id}</td>
                <td className="py-2 px-4">{new Date(s.start_time).toLocaleString()}</td>
                <td className="py-2 px-4">{new Date(s.end_time).toLocaleString()}</td>
                <td className="py-2 px-4 text-center">
                  {s.is_active ? (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Đang hoạt động</span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Ngừng hoạt động</span>
                  )}
                </td>
                <td className="py-2 px-4 text-center space-x-2">
                  <button
                    className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                    onClick={() => handleEdit(s)}
                  >
                    Sửa
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    onClick={async () => {
                      if (window.confirm("Bạn có chắc muốn xóa lịch thi này?")) {
                        await apiService.deleteExamSchedule(s.id);
                        fetchSchedules();
                      }
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">Không có lịch thi nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for create/update */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={closeModal}
              aria-label="Đóng"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {editing ? "Cập nhật lịch thi" : "Tạo mới lịch thi"}
            </h3>
            <ExamScheduleForm
              initialData={editing || undefined}
              onSuccess={() => {
                closeModal();
                fetchSchedules();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduleList;