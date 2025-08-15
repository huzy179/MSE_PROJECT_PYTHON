# Fullstack Demo Application

Một ứng dụng fullstack hiện đại được xây dựng với **FastAPI** (Backend) và **React + TypeScript + Vite** (Frontend).

## 🚀 Công nghệ sử dụng

### Backend
- **FastAPI** - Framework Python hiện đại cho API
- **SQLAlchemy** - ORM cho Python
- **PostgreSQL** - Cơ sở dữ liệu quan hệ
- **JWT** - Authentication và authorization
- **Pydantic** - Validation và serialization
- **Uvicorn** - ASGI server
- **python-docx** - Đọc file Word documents

### Frontend
- **React 19** - Thư viện UI
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool nhanh
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - CSS framework

## 📁 Cấu trúc dự án

```
fullstack-demo/
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
├── backend/                # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   └── routes/     # Individual route files
│   │   ├── core/           # Configuration và security
│   │   ├── db/             # Database connection
│   │   ├── models/         # SQLAlchemy models (User, Question)
│   │   ├── reading/        # Document processing logic
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # Application entry point
├── frontend/               # React Frontend
│   ├── .env.example        # Environment variables template
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── config/         # Configuration files
│   │   ├── contexts/       # React contexts
│   │   ├── guards/         # Route guards
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Routing configuration
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   │   └── utils/          # Utility functions
│   ├── package.json        # Node dependencies
│   └── vite.config.ts      # Vite configuration
└── env/                    # Python virtual environment
```

## 🛠️ Cài đặt và chạy dự án

### Yêu cầu hệ thống
- **Python 3.8+**
- **Node.js 18+**
- **PostgreSQL 12+**

### 1. Clone repository
```bash
git clone <repository-url>
cd fullstack-demo
```

### 2. Cài đặt Backend

#### Tạo và kích hoạt virtual environment
```bash
# Tạo virtual environment ở root project
python -m venv env

# Kích hoạt virtual environment
# Trên macOS/Linux:
source env/bin/activate
# Trên Windows:
# env\Scripts\activate
```

#### Cài đặt dependencies
```bash
cd backend
pip install -r requirements.txt

# Cài đặt thêm packages cần thiết
pip install psycopg2-binary python-docx
```

#### Cấu hình Database
1. Tạo database PostgreSQL với tên `MSE`
2. Cấu hình database trong `backend/app/core/config.py`:
```python
DB_USER: str = "postgres"
DB_PASS: str = "postgres"
DB_HOST: str = "localhost"
DB_PORT: str = "5432"
DB_NAME: str = "MSE"
```

#### Database Setup
```bash
# Database tables sẽ được tạo tự động khi chạy app
# Không cần migration vì sử dụng create_all()
```

#### Chạy Backend server
```bash
# Từ thư mục backend/
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend sẽ chạy tại: http://localhost:8000
API Documentation: http://localhost:8000/docs

### 3. Cài đặt Frontend

#### Cài đặt dependencies
```bash
cd frontend
npm install
```

#### Cấu hình Environment Variables
```bash
# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa .env nếu cần thiết (mặc định đã phù hợp cho development)
```

#### Chạy Frontend development server
```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## 📝 API Documentation

Backend API cung cấp các endpoint sau:

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký

### Users
- `GET /api/v1/users/` - Lấy danh sách users (authenticated)
- `GET /api/v1/users/me` - Lấy thông tin user hiện tại
- `PATCH /api/v1/users/{user_id}/restore` - Khôi phục user đã xóa

### Questions
- `GET /api/v1/questions/import_file` - Test endpoint
- `POST /api/v1/questions/import_file` - Import questions từ file .docx
- `GET /api/v1/questions/list` - Lấy danh sách questions

Chi tiết API có thể xem tại Swagger UI: http://localhost:8000/docs

## 🔧 Scripts có sẵn

### Backend
```bash
# Chạy server development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test import
python -c "from app.models.user import User; print('✅ Import OK')"
```

### Frontend
```bash
# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## 🔒 Authentication

Ứng dụng sử dụng JWT (JSON Web Token) để xác thực:
- Access token có thời hạn 30 phút
- Token được lưu trong localStorage
- Protected routes yêu cầu authentication
- Automatic token refresh (nếu implemented)

## 🌍 Environment Variables

### Backend
Tạo file `.env` trong thư mục `backend/` (tùy chọn):
```env
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=MSE
SECRET_KEY=your-secret-key
```

### Frontend
Tạo file `.env` trong thư mục `frontend/` dựa trên `.env.example`:
```bash
cd frontend
cp .env.example .env
```

Cấu hình các biến môi trường trong `.env`:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Development Configuration
VITE_APP_TITLE=MSE Frontend
VITE_APP_VERSION=1.0.0

# Optional: Enable/disable features
VITE_ENABLE_DEBUG_LOGS=true
```

**Lưu ý:** File `.env` đã được thêm vào `.gitignore` để tránh commit thông tin nhạy cảm.

## ✨ Features

### 🔐 Authentication System
- JWT-based authentication
- User registration và login
- Role-based access control (Admin, Teacher, Student)
- Protected routes

### 📄 Document Processing
- Import questions từ file .docx
- Parse structured question format
- Support cho images trong questions
- Automatic data validation

### � User Management
- User CRUD operations
- Soft delete functionality
- Role management
- User listing với pagination

### 🎨 Modern Frontend
- React 19 với TypeScript
- Responsive design với Tailwind CSS
- Environment-based configuration
- Centralized API management
- Debug logging system

## �🚀 Deployment

### Backend Deployment
1. Cài đặt dependencies: `pip install -r requirements.txt`
2. Cấu hình database production
3. Chạy với Uvicorn: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Frontend Deployment
1. Build: `npm run build`
2. Deploy thư mục `dist/` lên static hosting (Vercel, Netlify, etc.)

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push branch: `git push origin feature/AmazingFeature`
5. Tạo Pull Request

## 📄 License

Dự án này được phát hành dưới giấy phép MIT License.

## 📞 Liên hệ

- Email: your-email@example.com
- GitHub: [your-github-username](https://github.com/your-github-username)

---

⭐ Nếu dự án này hữu ích, hãy cho một star nhé!
