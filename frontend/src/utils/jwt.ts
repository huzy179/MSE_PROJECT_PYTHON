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
    console.log('🟢 Decoding JWT token...');
    // JWT có 3 phần được phân tách bởi dấu chấm
    const parts = token.split('.');
    console.log('🟢 Token parts count:', parts.length);

    if (parts.length !== 3) {
      console.log('🔴 Invalid token format - not 3 parts');
      return null;
    }

    // Phần payload là phần thứ 2 (index 1)
    const payload = parts[1];
    console.log('🟢 Payload part:', payload);

    // Decode base64url
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    console.log('🟢 Decoded payload string:', decoded);

    // Parse JSON
    const parsed = JSON.parse(decoded) as JWTPayload;
    console.log('🟢 Parsed payload object:', parsed);

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
  console.log('🟢 Decoding token for user ID...');
  const payload = decodeJWT(token);
  console.log('🟢 Decoded payload:', payload);

  if (!payload) {
    console.log('🔴 No payload found');
    return null;
  }

  // Thử lấy user_id từ các field khác nhau
  if (payload.user_id) {
    console.log('🟢 Found user_id:', payload.user_id);
    return payload.user_id;
  }

  // Nếu sub là số, sử dụng sub làm user_id
  const subAsNumber = parseInt(payload.sub);
  if (!isNaN(subAsNumber)) {
    console.log('🟢 Using sub as user_id:', subAsNumber);
    return subAsNumber;
  }

  console.log('🔴 No valid user ID found in token');
  return null;
};
