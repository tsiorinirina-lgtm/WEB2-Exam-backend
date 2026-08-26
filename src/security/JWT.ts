import dotenv from "dotenv";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { AuthenticatedUser } from "../models/User.ts";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";

export const verifyToken = (token: string): AuthenticatedUser =>
  jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

export const signToken = (user: AuthenticatedUser): string =>
  jwt.sign(user, JWT_SECRET, { expiresIn: "15Min" } as SignOptions);
