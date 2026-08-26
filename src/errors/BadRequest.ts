import { HttpError } from "./HttpError.ts";

export class BadRequestError extends HttpError {
  constructor(message = "Please check the validity of your request") {
    super(400, message);
    this.name = "BadRequestError";
  }
}

export default BadRequestError;
