interface JWTPayload {
  sub: string; // subject - thường là user ID
  user_id?: number;
  username?: string;
  role?: string;
  exp: number;
  iat?: number;
  [key: string]: any;
}

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT có 3 phần được phân tách bởi dấu chấm
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    // Phần payload là phần thứ 2 (index 1)
    const payload = parts[1];

    // Decode base64url
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

    // Parse JSON
    const parsed = JSON.parse(decoded) as JWTPayload;

    return parsed;
  } catch (error) {
    console.error('🔴 Error decoding JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

export const getUserIdFromToken = (token: string): number | null => {
  const payload = decodeJWT(token);

  if (!payload) {
    return null;
  }

  // Thử lấy user_id từ các field khác nhau
  if (payload.user_id) {
    return payload.user_id;
  }

  // Nếu sub là số, sử dụng sub làm user_id
  const subAsNumber = parseInt(payload.sub);
  if (!isNaN(subAsNumber)) {
    return subAsNumber;
  }

  return null;
};
