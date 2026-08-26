import type { RequestHandler } from "express";
import { verifyAccessToken } from "./JWT.ts";
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
    req.authUser = verifyAccessToken(token);
    next();
  } catch (error) {
    return res.send(error);
  }
};

export const authorizeUser: RequestHandler = (req, res, next) => {
  if (
    req.authUser.role !== "admin" ||
    !req.authUser.is_active ||
    !req.authUser
  ) {
    const error = new UnauthorizedError("Unauthorized");
    return res.status(error.statusCode).json({ message: error.message });
  }
  next();
};
