import { Role } from "./Role.ts";

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
    firstname: string;
    lastname: string;
    is_active: boolean;
    created_at: Date;
    role: Role;
}

export interface UserCredential {
    email: string;
    password: string;
}