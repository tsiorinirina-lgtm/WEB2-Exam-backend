import type { Request, Response, NextFunction, Express } from "express";
import { AuthService } from "../services/AuthService.ts";
import BadRequest from "../errors/BadRequest.ts";
import { UnauthorizedError } from "../errors/Unauthorized.ts";
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
    app.post("/api/auth/refresh",(req: Request, res: Response, next: NextFunction) => {this.refresh(req, res, next)})
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
      res.cookie("refreshToken", authentication.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7*24*60*60*1000,
      })
      res.status(200).json({
        token: authentication.accessToken,
        user: {
          id: authentication.user.id,
          name: authentication.user.name,
          role: authentication.user.role,
        },
      });
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      next(error);
    }
  };

private refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      const error = new UnauthorizedError("No refresh token in your request");
      res.status(error.statusCode).json({message : error.message});
    }
    const result = await this.authService.refresh(refreshToken);
       res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7*24*60*60*1000,
      });
      res.status(200).json({accessToken: result.accessToken, user: result.user});
  }
}
}
