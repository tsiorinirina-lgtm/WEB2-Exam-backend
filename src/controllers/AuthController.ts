import type { Request, Response, NextFunction, Express } from "express";
import { AuthService } from "../services/AuthService.ts";
import { authenticateUser } from "../security/AuthMiddleware.ts";

export class AuthController {
  private authService: AuthService;

  constructor(app: Express) {
    this.authService = new AuthService();
    this.setupRoutes(app);
  }

  private setupRoutes = (app: Express): void => {
    app.post(
      "/api/auth/login",
      authenticateUser,
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
        res.sendStatus(400);
      }
      const { email, password } = req.body;
      const authentication = await this.authService.login({ email, password });
      res.status(200).json({ authentication });
    } catch (error) {
      next(error);
    }
  };
}
