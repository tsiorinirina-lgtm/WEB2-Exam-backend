import { Role } from "./Role.ts";

export interface User {
    id: number;
    mail: string;
    firstname: string;
    lastname: string;
    password_hash: string;
    is_active: boolean;
    joined_at: Date;
    role: Role;
}

export interface UserCreateDTO {
    mail: string;
    firstname: string;
    lastname: string;
    password_hash: string;
    role: Role;
}

export interface UserUpdateDTO {
    mail?: string;
    firstname?: string;
    lastname?: string;
    is_active?: boolean;
    password_hash?: string;
}

export interface AuthenticatedUser {
    id: string;
    mail: string;
    firstname: string;
    lastname: string;
    is_active: boolean;
    joined_at: Date;
    role: Role;
}