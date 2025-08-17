import React, { useState, useRef } from "react";
import { config } from '../config/env';
import { useAuth } from '../hooks/useAuth';

interface TableData {
  rows: string[][];
}

const Import: React.FC = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const user = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn file trước!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user", JSON.stringify(user.user));

    try {
      const res = await fetch(config.apiBaseUrl+"/v1/questions/import_file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Upload failed");
        return;
      }

      const data = await res.json();
      if(data.code!=200){
          console.log("Có lỗi:",data.message);
          setErrorMessage(data.message);
          setSuccessMessage("");
      }else{
          setTableData(data.data);
          setSuccessMessage("Quá trình import dữ liệu thành công. Dưới đây là danh sách đã import");
          setErrorMessage("");
      }

    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Có lỗi xảy ra. Liên hệ để được hỗ trợ.");
      setSuccessMessage("");
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setTableData([]); // reset data table
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // reset input file
    }
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
        <h2 className="text-lg font-semibold mb-4">
            Import data from .docx file
        </h2>
      <input type="file" accept=".docx" ref={fileInputRef} onChange={handleFileChange} />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleUpload} disabled={!selectedFile || errorMessage || successMessage}
            className={`px-4 py-1 rounded text-white font-semibold transition ${
            selectedFile && !errorMessage && !successMessage
              ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Upload
        </button>
        <button onClick={handleClear} style={{ marginLeft: "24px" }}
            className="px-4 py-1 rounded bg-orange-500 text-white hover:bg-orange-600"
        >
          Clear
        </button>
      </div>
        {errorMessage && (
        <p style={{ color: "red", marginTop: "4px" }}>{errorMessage}</p>
      )}
        {successMessage && (
            <p style={{ color: "green", marginTop: "4px" }}>{successMessage}</p>
        )}
      <div>
      </div>

      <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
      {tableData.length > 0 && (
        <table
          className="min-w-full divide-y divide-gray-200"
        >
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Câu hỏi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ảnh minh hoạ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phương án A
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phương án B
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phương án C
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phương án D
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đáp án đúng
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Điểm
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bài học
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mix
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Môn học
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giảng viên
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người nhập
              </th>
            </tr>
          </thead>

          <tbody>
              {tableData.map((row, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.code}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.content}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.content_img}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.choiceA}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.choiceB}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.choiceC}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.choiceD}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.answer}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.mark}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.unit}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {String(row.mix)}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.subject}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.lecturer}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                  {row.importer}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
        </div>
    </div>
  );
};

export default Import;
