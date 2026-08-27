import type { Request, Response, Express } from "express";
import type { Course } from "../models/Course.ts";
import { CourseService } from "../services/CourseService.ts";
import { HttpError } from "../errors/HttpError.ts";
import { BadRequestError } from "../errors/BadRequest.ts";
import { InternalServerError } from "../errors/InternalServer.ts";
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
      (req: Request, res: Response) => this.getAllCourses(req, res),
    );
    app.post(
      "api/courses",
      authenticateUser,
      authorizeUser("admin"),
      (req: Request, res: Response) => this.createCourse(req, res),
    );
    app.get(
      "/api/courses/:id",
      authenticateUser,
      authorizeUser("admin"),
      (req: Request, res: Response) => this.getCourseById(req, res),
    );
    app.put(
      "/api/courses/:id",
      authenticateUser,
      authorizeUser("admin"),
      (req: Request, res: Response) => this.updateCourse(req, res),
    );
    app.delete(
      "/api/courses/:id",
      authenticateUser,
      authorizeUser("admin"),
      (req: Request, res: Response) => this.deleteCourse(req, res),
    );
  }

  private async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const courses: Course[] = await this.courseService.getAllCourses();
      res.status(200).json(courses);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  }

  private async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const course: Course = req.body;
      const createdCourse: Course =
        await this.courseService.createCourse(course);
      res.status(201).json(createdCourse);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  }

  private async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const id: number = parseInt(req.params.id as string);
      if (Number.isNaN(id)) {
        throw new BadRequestError("Course id must be a number");
      }
      const course: Course = await this.courseService.getCourseById(id);
      res.status(200).json(course);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  }

  private async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const id: number = parseInt(req.params.id as string);
      if (Number.isNaN(id)) {
        throw new BadRequestError("Course id must be a number");
      }
      const course: Course = req.body;
      const updatedCourse: Course = await this.courseService.updateCourse(
        id,
        course,
      );
      res.status(200).json(updatedCourse);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  }

  private async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const id: number = parseInt(req.params.id as string);
      if (Number.isNaN(id)) {
        throw new BadRequestError("Course id must be a number");
      }
      await this.courseService.deleteCourse(id);
      res.sendStatus(204);
    } catch (error) {
      const responseError =
        error instanceof HttpError ? error : new InternalServerError();
      res
        .status(responseError.statusCode)
        .json({ message: responseError.message });
    }
  }
}
