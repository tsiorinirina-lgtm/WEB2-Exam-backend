import type { Request, Response, NextFunction } from "express";

const toSnake = (key: string): string =>
  key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toCamel = (key: string): string =>
  key.replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());

function convertKeys(value: unknown, convert: (key: string) => string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeys(item, convert));
  }
  if (value === null || typeof value !== "object" || value instanceof Date) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      convert(key),
      convertKeys(entry, convert),
    ]),
  );
}

export function camelCaseRequestBody(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.body && typeof req.body === "object") {
    req.body = convertKeys(req.body, toCamel);
  }
  next();
}

export function snakeCaseResponseBody(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const json = res.json.bind(res);
  res.json = (body: unknown) => json(convertKeys(body, toSnake));
  next();
}
