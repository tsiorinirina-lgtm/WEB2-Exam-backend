export type Role = "admin" | "student";

export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  role: Role;
}

export type PublicUser = Omit<User, "password">;

export interface UserCreateDTO {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export interface UserUpdateDTO {
  email?: string;
  name?: string;
  isActive?: boolean;
  password?: string;
}

export interface AuthenticatedUser {
  id: number;
  mail: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
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
