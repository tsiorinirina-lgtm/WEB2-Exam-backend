import type { Request, Response, Express } from "express";
import type { Course } from "../models/Course.ts";
import { CourseService } from "../services/CourseService.ts";
import { BadRequestError } from "../errors/BadRequestError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { InternalServerError } from "../errors/InternalServerError.ts";
import { ForbiddenError } from "../errors/ForbiddenError.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";
import { authenticateUser, authorizeUser } from "../security/AuthMiddleware.ts";

export class CourseController {
  private courseService: CourseService;

  constructor(app: Express) {
    this.courseService = new CourseService();
    this.setupRoutes(app);
  }

  private setupRoutes(app: Express) {
    app.get(
      "/api/courses",
      authenticateUser,
      authorizeUser("admin"),
      async (req: Request, res: Response) => this.getAllCourses(req, res),
    );
    app.post(
      "api/courses",
      authenticateUser,
      authorizeUser("admin"),
      async (req: Request, res: Response) => this.createCourse(req, res),
    );
    app.get(
      "/api/courses/:id",
      authenticateUser,
      authorizeUser("admin"),
      async (req: Request, res: Response) => this.getCourseById(req, res),
    );
    app.put(
      "/api/courses/:id",
      authenticateUser,
      authorizeUser("admin"),
      async (req: Request, res: Response) => this.updateCourse(req, res),
    );
    app.delete(
      "/api/courses/:id",
      authenticateUser,
      authorizeUser("admin"),
      async (req: Request, res: Response) => this.deleteCourse(req, res),
    );
  }
}
