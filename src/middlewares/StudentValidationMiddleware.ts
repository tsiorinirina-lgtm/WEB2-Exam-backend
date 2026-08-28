import type { RequestHandler } from "express";
import { BadRequestError } from "../errors/BadRequest.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateStudentCreation: RequestHandler = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    const error = new BadRequestError("Student data must be an object");
    return res.status(error.statusCode).json({ message: error.message });
  }

  const { name, email } = body;
  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    typeof email !== "string" ||
    email.trim().length === 0
  ) {
    const error = new BadRequestError(
      "Name, email, and password are required",
    );
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    const error = new BadRequestError("Email must be valid");
    return res.status(error.statusCode).json({ message: error.message });
  }

  next();
};
