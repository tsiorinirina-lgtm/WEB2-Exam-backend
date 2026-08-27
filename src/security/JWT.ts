import dotenv from "dotenv";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { AuthenticatedUser } from "../models/User.ts";
import { createHash, randomBytes, randomUUID } from "crypto";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured");
}

export const verifyToken = (token: string): AuthenticatedUser =>
  jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

export const signToken = (user: AuthenticatedUser): string =>
  jwt.sign(user, JWT_SECRET, { expiresIn: "15m" } as SignOptions);

export const generateRefreshToken = (): string =>
  randomBytes(32).toString("hex");

export const hashRefreshToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const generateTokenFamilyId = (): string => randomUUID();
