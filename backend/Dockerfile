# Dùng Python 3.11
FROM python:3.11-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt dependencies hệ thống cần thiết cho PostgreSQL
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy và cài đặt Python packages
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy source code
COPY . .

# Mở port 8000
EXPOSE 8000

# Chạy ứng dụng
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]