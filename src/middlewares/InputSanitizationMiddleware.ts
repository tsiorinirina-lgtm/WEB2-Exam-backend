import type { RequestHandler } from "express";

const SENSITIVE_FIELDS = new Set(["password", "password_hash"]);

const sanitizeValue = (value: unknown, fieldName?: string): unknown => {
  if (typeof value === "string") {
    return SENSITIVE_FIELDS.has(fieldName ?? "") ? value : value.trim();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sanitizeValue(item, key),
      ]),
    );
  }

  return value;
};

export const sanitizeUserInput: RequestHandler = (req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }

  next();
};
