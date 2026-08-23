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