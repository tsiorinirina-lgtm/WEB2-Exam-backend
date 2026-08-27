import { Request, Response, Express } from "express";
import { QuestionService } from "../services/QuestionService";
import { authenticateUser, authorizeUser } from "../security/AuthMiddleware.ts";

export class QuestionController {
  private questionService: QuestionService;
  constructor(app: Express) {
    this.questionService = new QuestionService();
    this.setupRoutes(app);
  }

  private setupRoutes(app: Express) {
    app.get(
      "api/exams/:id/questions",
      authenticateUser,
      (req: Request, res: Response) => this.getAllQuestions(req, res),
    );
    app.post(
      "api/exams/:id/questions",
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
}
