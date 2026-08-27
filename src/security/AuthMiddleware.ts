import type { RequestHandler } from "express";
import { verifyToken } from "./JWT.ts";
import { UnauthorizedError } from "../errors/Unauthorized.ts";
import type { AuthenticatedUser } from "../models/User.ts";

const BEARER_PREFIX = "Bearer ";

declare global {
  namespace Express {
    interface Request {
      authUser: AuthenticatedUser;
    }
  }
}

export const authenticateUser: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
    const error = new UnauthorizedError("Invalid access token");
    return res.status(error.statusCode).json({ message: error.message });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.authUser = verifyToken(token);
    next();
  } catch (error) {
    return res.send(error);
  }
};

export const authorizeUser =
  (role: string): RequestHandler =>
  (req, res, next) => {
    if (
      req.authUser.role !== "admin" ||
      !req.authUser.isActive ||
      !req.authUser
    ) {
      const error = new UnauthorizedError("Insufficient permissions");
      return res.status(error.statusCode).json({ message: error.message });
    }
    next();
  };
