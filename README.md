# Fullstack Demo Application

Một ứng dụng fullstack hiện đại được xây dựng với **FastAPI** (Backend) và **React + TypeScript + Vite** (Frontend).

## 🚀 Công nghệ sử dụng

### Backend
- **FastAPI** - Framework Python hiện đại cho API
- **SQLAlchemy** - ORM cho Python
- **PostgreSQL** - Cơ sở dữ liệu quan hệ
- **Alembic** - Database migration tool
- **JWT** - Authentication và authorization
- **Pydantic** - Validation và serialization
- **Uvicorn** - ASGI server

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
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration và security
│   │   ├── crud/           # Database operations
│   │   ├── db/             # Database connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── alembic/            # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # Application entry point
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── guards/         # Route guards
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Routing configuration
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
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
# Tạo virtual environment
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

#### Chạy migrations
```bash
# Khởi tạo database
python init_db.py

# Chạy migrations (nếu cần)
alembic upgrade head

# Seed data (tùy chọn)
python seed_data.py
```

#### Chạy Backend server
```bash
python main.py
# hoặc
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend sẽ chạy tại: http://localhost:8000
API Documentation: http://localhost:8000/docs

### 3. Cài đặt Frontend

#### Cài đặt dependencies
```bash
cd frontend
npm install
```

#### Chạy Frontend development server
```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## 📝 API Documentation

Backend API cung cấp các endpoint sau:

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/` - Lấy danh sách users (authenticated)
- `GET /api/users/me` - Lấy thông tin user hiện tại
- `PUT /api/users/me` - Cập nhật thông tin user

Chi tiết API có thể xem tại Swagger UI: http://localhost:8000/docs

## 🔧 Scripts có sẵn

### Backend
```bash
# Chạy server development
python main.py

# Chạy migrations
alembic upgrade head

# Tạo migration mới
alembic revision --autogenerate -m "description"

# Seed data
python seed_data.py
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
Tạo file `.env` trong thư mục `frontend/` (tùy chọn):
```env
VITE_API_URL=http://localhost:8000
```

## 🚀 Deployment

### Backend Deployment
1. Cài đặt dependencies: `pip install -r requirements.txt`
2. Cấu hình database production
3. Chạy migrations: `alembic upgrade head`
4. Chạy với Gunicorn: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`

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
