# MSE Project - Fullstack Application

Ứng dụng fullstack được xây dựng với **FastAPI** (Backend) và **React + TypeScript + Vite** (Frontend).

## 🚀 Công nghệ sử dụng

### Backend
- **FastAPI** - Framework Python cho API
- **SQLAlchemy** - ORM cho Python
- **PostgreSQL** - Cơ sở dữ liệu
- **JWT** - Authentication
- **python-docx** - Xử lý file Word

### Frontend
- **React 19** - Thư viện UI
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - CSS framework

## 📁 Cấu trúc dự án

```
MSE_PROJECT_PYTHON/
├── backend/                # FastAPI Backend
│   ├── app/
│   │   ├── api/routes/     # API routes
│   │   ├── core/           # Configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   └── requirements.txt
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json
└── env/                    # Python virtual environment
```

## 🛠️ Cài đặt và chạy

### Yêu cầu
- Python 3.8+
- Node.js 18+
- PostgreSQL (database tên 'MSE')

### 1. Setup Database
```bash
# Tạo database PostgreSQL
createdb MSE

# Hoặc sử dụng psql
psql -U postgres
CREATE DATABASE "MSE";
\q
```

### 2. Setup Environment Variables

#### Backend
```bash
cd backend
cp .env.example .env
# Chỉnh sửa .env nếu cần thiết (database credentials, etc.)
```

#### Frontend
```bash
cd frontend
cp .env.example .env
# Chỉnh sửa .env nếu cần thiết
```

### 3. Backend Setup
```bash
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
cd backend
pip install -r requirements.txt

# Tạo tables và seed data
python seed_data.py

# Chạy server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
➜ http://localhost:8000

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
➜ http://localhost:5174

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Thông tin user hiện tại

### Users
- `GET /api/users/` - Danh sách users (admin only)
- `GET /api/users/{id}` - Thông tin user theo ID
- `DELETE /api/users/{id}` - Xóa user (admin only)

### Questions
- `POST /api/questions/import_file` - Import từ file .docx
- `GET /api/questions/list` - Danh sách questions

**API Documentation:** http://localhost:8000/docs

## � Default Users (từ seed data)

Sau khi chạy `python seed_data.py`, hệ thống sẽ tạo các user mặc định:

| Username | Password | Role | Mô tả |
|----------|----------|------|-------|
| `admin` | `admin123` | admin | Quản trị viên - Full quyền |
| `teacher1` | `teacher123` | teacher | Giáo viên - Quản lý khóa học |
| `student1` | `student123` | student | Học sinh - Xem khóa học |

## �🔧 Environment Variables

### Backend (.env)
```env
# Database Configuration
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=MSE

# Security Configuration
SECRET_KEY=your_secret_key_here

# CORS Configuration
BACKEND_CORS_ORIGINS=http://localhost:5174
```

### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Development Configuration
VITE_APP_TITLE=MSE Frontend
VITE_APP_VERSION=1.0.0

# Optional: Enable/disable features
VITE_ENABLE_DEBUG_LOGS=true
```

## 🔧 Commands

```bash
# Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
python format.py

# Frontend
npm run dev
npm run build
```

## ✨ Features

- **Authentication:** JWT-based với role management
- **Document Processing:** Import questions từ file .docx
- **User Management:** CRUD operations với soft delete
- **Modern UI:** React 19 + TypeScript + Tailwind CSS

**MSE Project** - Fullstack Application với FastAPI & React
