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

### Backend
```bash
python -m venv env
source env/bin/activate
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
➜ http://localhost:8000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
➜ http://localhost:5173

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký

### Users
- `GET /api/v1/users/me` - Thông tin user hiện tại
- `GET /api/v1/users/` - Danh sách users

### Questions
- `POST /api/v1/questions/import_file` - Import từ file .docx
- `GET /api/v1/questions/list` - Danh sách questions

**API Documentation:** http://localhost:8000/docs

## 🔧 Commands

```bash
# Backend
uvicorn app.main:app --reload --port 8000
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
