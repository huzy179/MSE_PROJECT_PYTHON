// User roles constants
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  IMPORTER: 'importer',
  EDITOR: 'editor',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
