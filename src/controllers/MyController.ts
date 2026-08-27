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
}
