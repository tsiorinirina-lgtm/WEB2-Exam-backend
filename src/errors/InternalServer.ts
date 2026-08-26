import { HttpError } from "./HttpError.ts";

export class InternalServerError extends HttpError {
  constructor(message = "Internal server error") {
    super(500, message);
    this.name = "InternalServerError";
  }
}
