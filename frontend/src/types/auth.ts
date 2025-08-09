// User authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// User management types
export interface UserListParams {
  include_deleted?: boolean;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  data: User[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

// API response types
export interface ApiError {
  detail: string;
}
