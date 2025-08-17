// Route configuration
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  USERS: '/users',
  IMPORT: '/import',
  
  // Admin only routes
  ADMIN: '/admin',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.USERS,
  ROUTES.IMPORT,
];

export const ADMIN_ROUTES = [
  ROUTES.ADMIN,
];
