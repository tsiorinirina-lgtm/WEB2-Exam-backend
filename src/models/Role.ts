export const Role = {
    ADMIN: 'admin',
    STUDENT: 'student',
} as const;

export type Role = typeof Role[keyof typeof Role];