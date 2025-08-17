// User roles constants
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
