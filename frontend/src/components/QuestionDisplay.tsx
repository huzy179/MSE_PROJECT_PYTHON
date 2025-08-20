import React from 'react';
import type { Question } from '../types';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (questionId: number, selectedOption: string) => void;
  isReviewMode?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  isReviewMode = false,
}) => {
  const handleOptionSelect = (option: string) => {
    if (!isReviewMode) {
      onAnswerSelect(question.id, option);
    }
  };

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const options = [
    question.choiceA,
    question.choiceB,
    question.choiceC,
    question.choiceD,
  ].filter(Boolean); // Remove empty options

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Question Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Câu {questionNumber}/{totalQuestions}
        </h2>
        <div className="flex items-center space-x-2">
          {selectedAnswer && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              Đã trả lời: {selectedAnswer}
            </span>
          )}
          <span className="text-sm text-gray-500">Môn: {question.subject}</span>
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {question.content}
        </h3>

        {/* Question Image if exists */}
        {question.content_img && (
          <div className="mb-4">
            <img
              src={question.content_img}
              alt="Question illustration"
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const optionLabel = getOptionLabel(index);
          const isSelected = selectedAnswer === optionLabel;

          return (
            <div
              key={index}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${isReviewMode ? 'cursor-not-allowed opacity-75' : ''}
              `}
              onClick={() => handleOptionSelect(optionLabel)}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 text-gray-600'
                  }
                `}
                >
                  {optionLabel}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{option}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Question Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Môn học: {question.subject || 'Chưa xác định'}</span>
          <span>Điểm: {question.mark || 1}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;
