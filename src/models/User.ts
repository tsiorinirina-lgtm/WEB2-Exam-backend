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

export interface UserCreateInput {
    mail: string;
    firstname: string;
    lastname: string;
    password_hash: string;
    role: 'admin' | 'student';
}

export interface UserUpdateInput {
    mail?: string;
    firstname?: string;
    lastname?: string;
    is_active?: boolean;
    role: 'admin' | 'student';
}