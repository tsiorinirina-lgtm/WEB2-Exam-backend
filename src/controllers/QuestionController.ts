import type { Request, Response, Express } from "express";
import { QuestionService } from "../services/QuestionService.ts";
import { authenticateUser, authorizeUser } from "../security/AuthMiddleware.ts";
import { HttpError } from "../errors/HttpError.ts";
import { InternalServerError } from "../errors/InternalServer.ts";
import { BadRequestError } from "../errors/BadRequest.ts";
import { pool } from "../config/database.ts";

export class QuestionController {
  private questionService: QuestionService;
  constructor(app: Express) {
    this.questionService = new QuestionService(pool);
    this.setupRoutes(app);
  }

  private setupRoutes(app: Express) {
    app.get(
      "/api/exams/:id/questions",
      authenticateUser,
      (req: Request, res: Response) => this.getAllQuestions(req, res),
    );
    app.post(
      "/api/exams/:id/questions",
      authenticateUser,
      authorizeUser("admin"),
      (req: Request, res: Response) => this.addQuestion(req, res),
    );
    app.put(
      "/api/questions/:id",
      authenticateUser,
      authorizeUser("admin"),
      (req: Request, res: Response) => this.updateQuestion(req, res),
    );
    app.delete(
      "/api/questions/:id",
      authenticateUser,
      authorizeUser("admin"),
      (req: Request, res: Response) => this.deleteQuestion(req, res),
    );
  }

  private getAllQuestions = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const is_admin = req.authUser.role === "admin";
      const questions = await this.questionService.getAllQuestions(
        parseInt(req.params.id as string),
        is_admin,
      );
      res.status(200).json(questions);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  };

  private addQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const question = await this.questionService.addQuestion(
        parseInt(req.params.id as string),
        req.body,
      );
      res.status(201).json(question);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  };

  private updateQuestion = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const id: number = parseInt(req.params.id as string);
      if (Number.isNaN(id)) {
        throw new BadRequestError("Question id must be a number");
      }
      const question = await this.questionService.updateQuestion(id, req.body);
      res.status(200).json(question);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  };

  private deleteQuestion = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const id: number = parseInt(req.params.id as string);
      if (Number.isNaN(id)) {
        throw new BadRequestError("Question id must be a number");
      }
      await this.questionService.deleteQuestion(id);
      res.sendStatus(204);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  };
}
