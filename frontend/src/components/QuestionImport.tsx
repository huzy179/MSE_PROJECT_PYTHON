import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';

interface ImportedQuestion {
  code: string;
  content: string;
  content_img?: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  answer: string;
  mark: number;
  unit?: string;
  mix: boolean;
  subject?: string;
  lecturer?: string;
  importer: string;
}

interface QuestionImportProps {
  onImportSuccess: () => void;
  onCancel: () => void;
}

const QuestionImport: React.FC<QuestionImportProps> = ({
  onImportSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importedQuestions, setImportedQuestions] = useState<
    ImportedQuestion[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setImportedQuestions([]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file trước!');
      return;
    }

    if (!user) {
      setError('Không thể xác thực người dùng');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await apiService.importQuestions(selectedFile, user);

      if (data.code !== 200) {
        setError(data.message || 'Có lỗi xảy ra khi import');
      } else {
        setImportedQuestions(data.data || []);
        setSuccess(`Import thành công ${data.data?.length || 0} câu hỏi!`);
        // Auto refresh parent component after successful import
        setTimeout(() => {
          onImportSuccess();
        }, 2000);
      }
    } catch (err) {
      logger.error('Import error:', err);
      setError('Có lỗi xảy ra khi import file. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setImportedQuestions([]);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Import câu hỏi từ file .docx
      </h3>

      {/* File Upload Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn file .docx
          </label>
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Đã chọn: {selectedFile.name} (
              {(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{loading ? 'Đang import...' : 'Import'}</span>
          </button>

          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Xóa
          </button>

          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Hủy
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{success}</span>
            </div>
          </div>
        )}
      </div>

      {/* Import Results */}
      {importedQuestions.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Kết quả import ({importedQuestions.length} câu hỏi)
          </h4>

          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nội dung
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đáp án
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Môn học
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importedQuestions.map((question, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {question.code}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div
                          className="max-w-xs truncate"
                          title={question.content}
                        >
                          {question.content}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {question.answer}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {question.mark}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {question.subject || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h5 className="text-base font-semibold text-blue-900 mb-3 flex items-center">
          📘 Hướng dẫn Import File
        </h5>
        <p className="text-sm text-blue-800 mb-2">
          File cần đúng định dạng <span className="font-medium">.docx</span> và
          tuân thủ cấu trúc sau:
        </p>
        <ul className="text-sm text-blue-800 space-y-1 pl-4 list-disc">
          <li>
            <span className="font-medium">Thông tin chung:</span>
            <ul className="pl-5 list-[circle] space-y-1">
              <li>Subject: ISC</li>
              <li>Number of Quiz: 30</li>
              <li>Lecturer: hungpd2</li>
              <li>Date: dd-mm-yyyy</li>
            </ul>
          </li>
          <li>
            <span className="font-medium">Mỗi câu hỏi (QN) phải có:</span>
            <ul className="pl-5 list-[circle] space-y-1">
              <li>Câu hỏi + (tuỳ chọn hình ảnh)</li>
              <li>4 lựa chọn: a, b, c, d</li>
              <li>ANSWER: (một trong A, B, C, D)</li>
              <li>MARK: (số điểm, ví dụ: 0.5)</li>
              <li>UNIT: (chương, ví dụ: Chapter1)</li>
              <li>MIX CHOICES: Yes/No</li>
            </ul>
          </li>
        </ul>
        <div className="mt-3 p-3 bg-white rounded border border-blue-100">
          <p className="text-sm font-medium text-blue-900">📑 Ví dụ:</p>
          <pre className="text-xs text-blue-800 whitespace-pre-line mt-1">
            {`QN=1
See the figure and choose the right type of B2B E-Commerce
[file:8435.jpg]

a. Sell-side B2B
b. Electronic Exchange
c. Buy-side B2B
d. Supply Chain Improvements and Collaborative Commerce
ANSWER: B
MARK: 0.5
UNIT: Chapter1
MIX CHOICES: Yes`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default QuestionImport;
