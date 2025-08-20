import React, { useEffect, useState } from 'react';
import type { ExamSchedule } from '../types/exam_schedule';
import type { Exam } from '../types/exam';
import { apiService } from '../services/api';
import ExamScheduleForm from '../components/ExamScheduleForm';

const ExamScheduleList: React.FC = () => {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [editing, setEditing] = useState<ExamSchedule | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [filterExamId, setFilterExamId] = useState<number | ''>('');
  const [filterActive, setFilterActive] = useState<'' | 'active' | 'inactive'>(
    ''
  );
  const [loading, setLoading] = useState(true);

  // Lấy danh sách kỳ thi để filter và form
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

  // Lấy danh sách lịch thi
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, size: 10 };
      if (filterExamId) params.exam_id = filterExamId;
      if (filterActive === 'active') params.is_active = true;
      if (filterActive === 'inactive') params.is_active = false;
      const res = await apiService.getExamSchedules(params);
      setSchedules(res.data);
    } catch {
      setSchedules([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line
  }, [filterExamId, filterActive]);

  const handleEdit = (schedule: ExamSchedule | null) => {
    setEditing(schedule);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditing(null);
    setShowModal(false);
  };

  // Hiển thị title kỳ thi thay vì id
  const getExamTitle = (exam_id: number) => {
    const exam = exams.find((e) => e.id === exam_id);
    return exam ? exam.title : exam_id;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý lịch thi
            </h1>
            <p className="mt-2 text-gray-600">
              Tạo và quản lý lịch thi cho các kỳ thi
            </p>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => handleEdit(null)}
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
            Tạo lịch thi mới
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kỳ thi
            </label>
            <select
              value={filterExamId}
              onChange={(e) =>
                setFilterExamId(e.target.value ? Number(e.target.value) : '')
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả kỳ thi</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filterActive}
              onChange={(e) =>
                setFilterActive(e.target.value as '' | 'active' | 'inactive')
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        {/* Exam Schedule List */}
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : schedules.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Không có lịch thi
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Bắt đầu bằng cách tạo lịch thi mới.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kỳ thi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bắt đầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kết thúc
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hoạt động
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {s.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {s.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getExamTitle(s.exam_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(s.start_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(s.end_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            s.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {s.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                            onClick={() => handleEdit(s)}
                          >
                            Sửa
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 text-sm"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  'Bạn có chắc muốn xóa lịch thi này?'
                                )
                              ) {
                                await apiService.deleteExamSchedule(s.id);
                                fetchSchedules();
                              }
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                {editing ? 'Cập nhật lịch thi' : 'Tạo mới lịch thi'}
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
    </div>
  );
};

export default ExamScheduleList;
