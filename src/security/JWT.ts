import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import type { AuthenticatedUser } from "../models/User.ts";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";

export const verifyAccessToken = (token: string): AuthenticatedUser =>
  jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

export const signAccessToken = (user: AuthenticatedUser): string =>
  jwt.sign(user, JWT_SECRET);
