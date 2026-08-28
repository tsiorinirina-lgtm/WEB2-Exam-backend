import type { Request, Response, NextFunction, Express } from "express";
import { AuthService } from "../services/AuthService.ts";
import BadRequest from "../errors/BadRequest.ts";
import { HttpError } from "../errors/HttpError.ts";
import { validatePassword } from "../middlewares/PasswordValidationMiddleware.ts";
import { sanitizeUserInput } from "../middlewares/InputSanitizationMiddleware.ts";

export class AuthController {
  private authService: AuthService;

  constructor(app: Express) {
    this.authService = new AuthService();
    this.setupRoutes(app);
  }

  private setupRoutes = (app: Express): void => {
    app.post(
      "/api/auth/login",
      sanitizeUserInput,
      validatePassword,
      (req: Request, res: Response, next: NextFunction) => {
        this.login(req, res, next);
      },
    );
  };

  private login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.body.email) {
        const error = new BadRequest(
          "Please check the validity of your request",
        );
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      const { email, password } = req.body;
      const authentication = await this.authService.login({ email, password });
      res.status(200).json({ authentication });
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      next(error);
    }
  };
}
