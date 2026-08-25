export type Role = 'admin' | 'student';

export interface User {
    id: number;
    email: string;
    name: string;
    password_hash: string;
    is_active: boolean;
    joined_at: Date;
    role: Role;
}

export interface UserCreateDTO {
    email: string;
    name: string;
    password_hash: string;
    role: Role;
}

export interface UserUpdateDTO {
    email?: string;
    name?: string;
    is_active?: boolean;
    password_hash?: string;
}

export interface AuthenticatedUser {
    id: string;
    mail: string;
    name: string;
    is_active: boolean;
    created_at: Date;
    role: Role;
}

export interface UserCredential {
    email: string;
    password: string;
}

export interface JwtPayload {
    userId: number;
    role: Role;
}

export interface LoginResponseDTO {
    token: string;
    user: AuthenticatedUser;
}