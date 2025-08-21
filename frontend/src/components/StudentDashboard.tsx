import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { ExamSchedule, SubmissionOut } from '../types';
import Loading from './Loading';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load available exam schedules for students
      const schedulesResponse =
        await apiService.getAvailableExamSchedulesForStudents({
          limit: 1000, // Load nhiều hơn để hiển thị tất cả
        });
      const allSchedules = schedulesResponse.data || [];

      // Filter active schedules
      const now = new Date();
      const activeSchedules = allSchedules.filter((schedule: ExamSchedule) => {
        const endTime = new Date(schedule.end_time);
        return schedule.is_active && endTime > now;
      });

      setExamSchedules(activeSchedules);

      // Load my submissions
      try {
        const submissionsResponse = await apiService.getMySubmissions();
        setSubmissions(submissionsResponse.data || []);
      } catch (error) {
        setSubmissions([]);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examScheduleId: number) => {
    // Navigate to exam page to show exam info first
    navigate(`/exam/${examScheduleId}`);
  };

  const getSubmissionCount = (examScheduleId: number): number => {
    const filteredSubmissions = submissions.filter(
      (submission) => submission.exam_schedule_id === examScheduleId
    );
    return filteredSubmissions.length;
  };

  const getExamStatus = (schedule: ExamSchedule) => {
    const now = new Date();
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    const submissionCount = getSubmissionCount(schedule.id);
    const maxAttempts = schedule.max_attempts || 1;

    // Kiểm tra đã hết lượt làm bài chưa
    if (submissionCount >= maxAttempts) {
      return {
        status: 'completed',
        text: `Đã làm ${submissionCount}/${maxAttempts} lần`,
        color: 'green',
      };
    }

    if (now < startTime) {
      return { status: 'upcoming', text: 'Sắp diễn ra', color: 'blue' };
    }

    if (now > endTime) {
      return { status: 'ended', text: 'Đã kết thúc', color: 'gray' };
    }

    return { status: 'available', text: 'Có thể làm bài', color: 'green' };
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Bài thi có sẵn
        </h2>

        {examSchedules.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <p className="text-gray-500">Hiện tại không có bài thi nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examSchedules.map((schedule) => {
              const status = getExamStatus(schedule);
              const submissionCount = getSubmissionCount(schedule.id);
              const maxAttempts = schedule.max_attempts || 1;
              const canTakeExam = status.status === 'available';

              return (
                <div
                  key={schedule.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {schedule.title}
                    </h3>
                    <span
                      className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${status.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                        ${status.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                        ${status.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                      `}
                    >
                      {status.text}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    {schedule.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span>Bắt đầu:</span>
                      <span>
                        {new Date(schedule.start_time).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kết thúc:</span>
                      <span>
                        {new Date(schedule.end_time).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số lần làm:</span>
                      <span>
                        {submissionCount}/{maxAttempts}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartExam(schedule.id)}
                    disabled={!canTakeExam}
                    className={`
                      w-full py-2 px-4 rounded-lg font-medium transition-colors
                      ${
                        canTakeExam
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {status.status === 'completed'
                      ? status.text
                      : canTakeExam
                        ? submissionCount > 0
                          ? `Làm lại (${submissionCount}/${maxAttempts})`
                          : 'Vào làm bài'
                        : status.status === 'upcoming'
                          ? 'Chưa đến giờ'
                          : status.status === 'ended'
                            ? 'Đã hết hạn'
                            : status.text}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      ;{/* My Submissions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Bài thi đã nộp
        </h2>

        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <p className="text-gray-500">Bạn chưa nộp bài thi nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const schedule = examSchedules.find(
                (s) => s.id === submission.exam_schedule_id
              );

              return (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {schedule?.title ||
                          `Bài thi #${submission.exam_schedule_id}`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Nộp lúc:{' '}
                        {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                      {submission.is_late && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Nộp trễ
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      {submission.score !== undefined ? (
                        <div className="text-lg font-semibold text-blue-600">
                          {submission.score} điểm
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Chưa chấm điểm
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      ;;
    </div>
  );
};

export default StudentDashboard;
