export interface User {
    id: string;
    mail: string;
    firstname: string;
    lastname: string;
    password_hash: string;
    is_active: boolean;
    joined_at: Date;
    role: 'admin' | 'student';
}

export interface UserCreateDTO {
    mail: string;
    firstname: string;
    lastname: string;
    password_hash: string;
    role: 'admin' | 'student';
}

export interface UserUpdateDTO {
    mail?: string;
    firstname?: string;
    lastname?: string;
    is_active?: boolean;
}

export interface AuthenticatedUser {
    id: string;
    mail: string;
    firstname: string;
    lastname: string;
    is_active: boolean;
    joined_at: Date;
    role: 'admin' | 'student';
}