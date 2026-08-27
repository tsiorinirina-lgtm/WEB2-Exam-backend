export type Role = "admin" | "student";

export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  is_active: boolean;
  joined_at: Date;
  role: Role;
}

export interface UserCreateDTO {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export interface UserUpdateDTO {
  email?: string;
  name?: string;
  is_active?: boolean;
  password?: string;
}

export interface AuthenticatedUser {
  id: number;
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

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}
