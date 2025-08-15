import React, { useState, useRef } from "react";
import { config } from '../config/env';

interface TableData {
  rows: string[][];
}

const Import: React.FC = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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
          setErrorMessage(data.message)
      }else{
          setTableData(data.data);
      }

    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Có lỗi xảy ra. Liên hệ để được hỗ trợ.")
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setTableData([]); // reset data table
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // reset input file
    }
    setErrorMessage("")
  };

  return (
    <div style={{ padding: "20px" }}>
        <h2 className="text-lg font-semibold mb-4">
            Import data from .docx file
        </h2>
      <input type="file" accept=".docx" ref={fileInputRef} onChange={handleFileChange} />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleUpload} disabled={!selectedFile}
            className={`px-4 py-1 rounded text-white font-semibold transition ${
            selectedFile
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
      <div>
      </div>

      {tableData.length > 0 && (
        <table
          border={1}
          cellPadding={5}
          style={{ marginTop: "20px", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              {Object.keys(tableData[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((value, j) => (
                  <td key={j}>{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Import;