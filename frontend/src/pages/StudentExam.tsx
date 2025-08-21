import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import ExamTaking from '../components/ExamTaking';
import Loading from '../components/Loading';
import { useAuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { ExamSchedule, Question } from '../types';
import type { Answer } from '../types/submission';

const StudentExam: React.FC = () => {
  const { examScheduleId } = useParams<{ examScheduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [examSchedule, setExamSchedule] = useState<ExamSchedule | null>(null);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  useEffect(() => {
    if (!examScheduleId) {
      setError('Không tìm thấy ID lịch thi');
      setLoading(false);
      return;
    }

    loadExamData();
  }, [examScheduleId]);

  const loadExamData = async () => {
    try {
      setLoading(true);

      // Load exam schedule with exam details
      const examScheduleData = await apiService.getExamScheduleWithExam(
        parseInt(examScheduleId!)
      );

      const { schedule, exam } = examScheduleData;
      if (!schedule) {
        setError('Không tìm thấy thông tin lịch thi');
        setLoading(false);
        return;
      }

      setExamSchedule(schedule);
      setExam(exam);

      // Check if exam is available for taking
      const now = new Date();
      const startTime = new Date(schedule.start_time);
      const endTime = new Date(schedule.end_time);

      if (now < startTime) {
        setError(
          `Bài thi chưa bắt đầu. Thời gian bắt đầu: ${startTime.toLocaleString()}`
        );
        setLoading(false);
        return;
      }

      if (now > endTime) {
        setError(
          `Bài thi đã kết thúc. Thời gian kết thúc: ${endTime.toLocaleString()}`
        );
        setLoading(false);
        return;
      }

      // Set questions from exam (but don't start exam yet)
      const examQuestions = exam.questions || [];
      setQuestions(examQuestions);

      setLoading(false);
    } catch (error: any) {
      console.error('Error loading exam data:', error);
      setError(error.response?.data?.detail || 'Không thể tải dữ liệu bài thi');
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    try {
      if (!examSchedule) return;

      // Create submission
      const submissionResponse = await apiService.startExamSubmission(
        examSchedule.id
      );
      const submission = submissionResponse.data;

      setCurrentSubmission(submission);
      setExamStarted(true);
    } catch (error: any) {
      console.error('Error starting exam:', error);
      setError(error.response?.data?.detail || 'Không thể bắt đầu bài thi');
    }
  };

  const handleSubmitExam = async (answers: Answer[]) => {
    try {
      if (!examSchedule || !currentSubmission) {
        throw new Error('Không tìm thấy thông tin lịch thi hoặc submission');
      }

      // Convert answers to JSON string
      const answersJson = JSON.stringify(answers);

      // Update existing submission instead of creating new one
      const result = await apiService.updateSubmission(currentSubmission.id, {
        answers: answersJson,
      });
      setSubmissionResult(result.data);

      toast.success('Nộp bài thành công!');

      // Redirect to results or dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast.error(error.response?.data?.detail || 'Lỗi khi nộp bài');
    }
  };

  const calculateTimeLimit = (): number => {
    if (!exam || !exam.duration) return 60; // Default 60 minutes
    return exam.duration; // Duration from exam in minutes
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải dữ liệu bài thi..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Không thể truy cập bài thi
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Quay về Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submissionResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Nộp bài thành công!
            </h2>
            <p className="text-gray-600 mb-4">
              Bài thi của bạn đã được nộp thành công.
            </p>
            {submissionResult.score !== undefined && (
              <p className="text-lg font-semibold text-blue-600 mb-4">
                Điểm số: {submissionResult.score}
              </p>
            )}
            <p className="text-sm text-gray-500 mb-6">
              Đang chuyển hướng về Dashboard...
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Quay về Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Chuẩn bị làm bài thi
            </h1>

            {examSchedule && (
              <div className="text-left bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Thông tin bài thi:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên bài thi:</span>
                    <span className="font-medium">{examSchedule.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mô tả:</span>
                    <span className="font-medium">
                      {examSchedule.description}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số câu hỏi:</span>
                    <span className="font-medium">{questions.length} câu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">
                      {calculateTimeLimit()} phút
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bắt đầu:</span>
                    <span className="font-medium">
                      {new Date(examSchedule.start_time).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kết thúc:</span>
                    <span className="font-medium">
                      {new Date(examSchedule.end_time).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">
                Lưu ý quan trọng:
              </h4>
              <ul className="text-sm text-yellow-700 text-left space-y-1">
                <li>• Sau khi bắt đầu, bạn không thể tạm dừng bài thi</li>
                <li>• Bài thi sẽ tự động nộp khi hết thời gian</li>
                <li>• Đảm bảo kết nối internet ổn định</li>
                <li>• Không được sử dụng tài liệu tham khảo</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleStartExam}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ExamTaking
      examScheduleId={examSchedule?.id || 0}
      questions={questions}
      timeLimit={calculateTimeLimit()}
      onSubmit={handleSubmitExam}
    />
  );
};

export default StudentExam;
