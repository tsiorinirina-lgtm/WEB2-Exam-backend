import type { Request, Response, NextFunction, Express } from "express";
import { AuthService } from "../services/AuthService.ts";
import { authenticateUser } from "../security/AuthMiddleware.ts";
import BadRequest from "../errors/BadRequest.ts";
import { InternalServerError } from "../errors/InternalServer.ts";

export class AuthController {
  private authService: AuthService;

  constructor(app: Express) {
    this.authService = new AuthService();
    this.setupRoutes(app);
  }

  private setupRoutes = (app: Express): void => {
    app.post(
      "/api/auth/login",
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
      if (!req.body.mail || !req.body.password) {
        const error = new BadRequest(
          "Please check the validity of your request",
        );
        res.status(error.statusCode).json({ message: error.message });
      }
      const { email, password } = req.body;
      const authentication = await this.authService.login({ email, password });
      res.status(200).json({ authentication });
    } catch (error) {
      const errorResponse = new InternalServerError(
        "We can't process your request now, please try again later",
      );
      res
        .status(errorResponse.statusCode)
        .json({ message: errorResponse.message });
    }
  };
}
