import type { Request, Response, Express } from "express";
import { QuestionService } from "../services/MyService.ts";
import { authenticateUser, authorizeUser } from "../security/AuthMiddleware.ts";
import { HttpError } from "../errors/HttpError.ts";
import { InternalServerError } from "../errors/InternalServer.ts";
import { BadRequestError } from "../errors/BadRequest.ts";

export class MyController {
  private questionService: QuestionService;
  constructor(app: Express) {
    this.questionService = new QuestionService();
    this.setupRoutes(app);
  }
  setupRoutes(app: Express) {
    app.get("api/my/exams", authenticateUser, (req: Request, res: Response) =>
      this.getAvailableExams(req, res),
    );
    app.get(
      "api/my/exams/:id",
      authenticateUser,
      (req: Request, res: Response) => this.getExamDetails(req, res),
    );
    app.get("api/my/results", authenticateUser, (req: Request, res: Response) =>
      this.getResults(req, res),
    );
    app.post(
      "api/my/exams/:id/submit",
      authenticateUser,
      (req: Request, res: Response) => this.submitAnswer(req, res),
    );
  }

  private getAvailableExams = async (req: Request, res: Response) => {
    try {
      const exams = await this.questionService.getAvailableExams(
        req.authUser.id,
      );
      res.status(200).json(exams);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  };

  private getExamDetails = async (req: Request, res: Response) => {
    try {
      const exam = await this.questionService.getExamDetails(req.params.id);
      res.status(200).json(exam);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  };

  private getResults = async (req: Request, res: Response) => {
    try {
      const results = await this.questionService.getResults(req.authUser.id);
      res.status(200).json(results);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  };

  private submitAnswer = async (req: Request, res: Response) => {
    try {
      const result = await this.questionService.submitAnswer(
        req.params.id,
        req.authUser.id,
        req.body,
      );
      res.status(200).json(result);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  };
}
