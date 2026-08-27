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

  private async getAllCourses(req: Request, res: Response) {
    const courses: Course[] = await this.courseService.getAllCourses();
    res.status(200).json(courses);
  }

  private async createCourse(req: Request, res: Response) {
    const course: Course = req.body;
    const createdCourse: Course = await this.courseService.createCourse(course);
    res.status(201).json(createdCourse);
  }

  private async getCourseById(req: Request, res: Response) {
    const id: number = parseInt(req.params.id as string);
    const course: Course = await this.courseService.getCourseById(id);
    res.status(200).json(course);
  }

  private async updateCourse(req: Request, res: Response) {
    const id: number = parseInt(req.params.id as string);
    const course: Course = req.body;
    const updatedCourse: Course = await this.courseService.updateCourse(
      id,
      course,
    );
    res.status(200).json(updatedCourse);
  }

  private async deleteCourse(req: Request, res: Response) {
    const id: number = parseInt(req.params.id as string);
    await this.courseService.deleteCourse(id);
    res.sendStatus(204);
  }
}
