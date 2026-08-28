import type { RequestHandler } from "express";
import { BadRequestError } from "../errors/BadRequest.ts";

export const MIN_PASSWORD_LENGTH = 8;

export const validatePassword: RequestHandler = (req, res, next) => {
  const password = req.body?.password;

  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    const error = new BadRequestError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    );
    return res.status(error.statusCode).json({ message: error.message });
  }

  next();
};
