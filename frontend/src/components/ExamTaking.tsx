import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '../types';
import type { Answer, ExamProgress } from '../types/submission';
import QuestionDisplay from './QuestionDisplay';
import toast from 'react-hot-toast';

interface ExamTakingProps {
  examScheduleId: number;
  questions: Question[];
  timeLimit: number; // in minutes
  onSubmit: (answers: Answer[]) => Promise<void>;
}

const ExamTaking: React.FC<ExamTakingProps> = ({
  examScheduleId,
  questions,
  timeLimit,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Initialize answers array
  useEffect(() => {
    const initialAnswers: Answer[] = questions.map((question) => ({
      questionId: question.id,
      selectedOption: '',
      isAnswered: false,
    }));
    setAnswers(initialAnswers);
  }, [questions]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswerSelect = useCallback(
    (questionId: number, selectedOption: string) => {
      setAnswers((prevAnswers) =>
        prevAnswers.map((answer) =>
          answer.questionId === questionId
            ? { ...answer, selectedOption, isAnswered: true }
            : answer
        )
      );
    },
    []
  );

    // Handle focus lost (click ra ngoài) => trừ 30% thời gian
  useEffect(() => {
    const handleBlur = () => {
      setTimeRemaining((prev) => {
        const newTime = Math.floor(prev - prev * 0.3);
        return newTime > 0 ? newTime : 0;
      });
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

    useEffect(() => {
    const handleBlur = () => {
      setTimeRemaining((prev) => {
        const newTime = Math.floor(prev - prev * 0.3);
        toast.error("⏱️ Bạn vừa bị trừ 30% thời gian vì thoát ra ngoài!");
        return newTime > 0 ? newTime : 0;
      });
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

    useEffect(() => {
    toast("⚠️ Lưu ý: Nếu thoát ra ngoài, bạn sẽ bị trừ 30% thời gian còn lại!");
  }, []);


  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(answers);
    } catch (error) {
      console.error('Auto submit failed:', error);
    }
  };

  const handleManualSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    try {
      await onSubmit(answers);
    } catch (error) {
      console.error('Manual submit failed:', error);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): ExamProgress => {
    const answeredQuestions = answers.filter(
      (answer) => answer.isAnswered
    ).length;
    return {
      totalQuestions: questions.length,
      answeredQuestions,
      currentQuestion: currentQuestionIndex + 1,
      timeSpent: timeLimit * 60 - timeRemaining,
    };
  };

  const progress = getProgress();
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(
    (answer) => answer.questionId === currentQuestion?.id
  );

  const isTimeRunningOut = timeRemaining <= 300; // 5 minutes warning

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and progress */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Làm bài thi
              </h1>
              <div className="text-sm text-gray-600">
                {progress.answeredQuestions}/{progress.totalQuestions} câu đã
                trả lời
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div
                className={`
                px-3 py-2 rounded-lg font-medium
                ${
                  isTimeRunningOut
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }
              `}
              >
                ⏰ {formatTime(timeRemaining)}
              </div>

              <button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(progress.answeredQuestions / progress.totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">
                Danh sách câu hỏi
              </h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questions.map((question, index) => {
                  const answer = answers.find(
                    (a) => a.questionId === question.id
                  );
                  const isAnswered = answer?.isAnswered || false;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`
                        w-10 h-10 rounded-lg text-sm font-medium transition-all
                        ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                            : isAnswered
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span>Đã trả lời</span>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Câu hiện tại</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <span>Chưa trả lời</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={currentAnswer?.selectedOption}
              onAnswerSelect={handleAnswerSelect}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() =>
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                }
                disabled={currentQuestionIndex === 0}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Câu trước
              </button>

              <button
                onClick={() =>
                  setCurrentQuestionIndex(
                    Math.min(questions.length - 1, currentQuestionIndex + 1)
                  )
                }
                disabled={currentQuestionIndex === questions.length - 1}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Câu tiếp →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận nộp bài
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn đã trả lời {progress.answeredQuestions}/
              {progress.totalQuestions} câu hỏi.
              {progress.answeredQuestions < progress.totalQuestions && (
                <span className="text-orange-600">
                  {' '}
                  Còn {progress.totalQuestions - progress.answeredQuestions} câu
                  chưa trả lời.
                </span>
              )}
            </p>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn nộp bài không? Sau khi nộp bài, bạn không
              thể thay đổi câu trả lời.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTaking;
