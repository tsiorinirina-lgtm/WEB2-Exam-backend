import { HttpError } from "./HttpError.ts";

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}
