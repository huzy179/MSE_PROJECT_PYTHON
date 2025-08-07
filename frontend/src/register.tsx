import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "./api";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/register", {
        username,
        password,
      });

      setMessage("Đăng ký thành công! Đang chuyển về trang đăng nhập...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        setMessage(axiosError.response?.data?.detail || "Đăng ký thất bại");
      } else {
        setMessage("Đăng ký thất bại");
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", paddingTop: "10vh" }}>
      <h2>Đăng ký</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          Đăng ký
        </button>
      </form>
      {message && <p style={{ textAlign: "center" }}>{message}</p>}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p>
          Đã có tài khoản?{" "}
          <Link to="/login" style={{ textDecoration: "none", color: "#007bff" }}>
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
