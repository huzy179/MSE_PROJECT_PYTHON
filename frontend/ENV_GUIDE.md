# Environment Variables Guide

## Tổng quan

Frontend sử dụng Vite để quản lý environment variables. Tất cả environment variables phải có prefix `VITE_` để có thể được truy cập từ client-side code.

## Cấu hình

### 1. Tạo file .env

```bash
# Tạo file .env từ template
cp .env.example .env
```

### 2. Các biến môi trường có sẵn

| Biến | Mô tả | Giá trị mặc định | Bắt buộc |
|------|-------|------------------|----------|
| `VITE_API_BASE_URL` | URL base của API backend | `http://localhost:8000/api` | ✅ |
| `VITE_APP_TITLE` | Tên ứng dụng hiển thị | `MSE Frontend` | ❌ |
| `VITE_APP_VERSION` | Phiên bản ứng dụng | `1.0.0` | ❌ |
| `VITE_ENABLE_DEBUG_LOGS` | Bật/tắt debug logs | `true` | ❌ |

### 3. Sử dụng trong code

```typescript
import { config } from '../config/env';

// Sử dụng config
console.log(config.apiBaseUrl);
console.log(config.appTitle);
console.log(config.enableDebugLogs);
```

## Môi trường khác nhau

### Development
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_ENABLE_DEBUG_LOGS=true
```

### Production
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_ENABLE_DEBUG_LOGS=false
```

### Testing
```env
VITE_API_BASE_URL=http://localhost:8001/api
VITE_ENABLE_DEBUG_LOGS=true
```

## Lưu ý quan trọng

1. **Bảo mật**: Không bao giờ commit file `.env` vào git
2. **Prefix**: Tất cả biến phải có prefix `VITE_`
3. **Build time**: Các biến được inject vào build time, không phải runtime
4. **Public**: Tất cả biến `VITE_*` đều public và có thể xem được từ browser

## Troubleshooting

### Biến không được load
- Kiểm tra prefix `VITE_`
- Restart dev server sau khi thay đổi .env
- Kiểm tra syntax trong file .env

### API không kết nối được
- Kiểm tra `VITE_API_BASE_URL`
- Đảm bảo backend đang chạy
- Kiểm tra CORS settings
