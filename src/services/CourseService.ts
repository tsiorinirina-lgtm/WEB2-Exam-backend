import type { Pool } from "pg";
import { pool as sharedPool } from "../config/database.ts";
import { CourseRepository } from "../repositories/CourseRepository.ts";
import type {
  Course,
  CourseCreateDTO,
  CourseUpdateDTO,
} from "../models/Course.ts";
import { BadRequestError } from "../errors/BadRequest.ts";
import { NotFoundError } from "../errors/NotFound.ts";
import { ConflictError } from "../errors/Conflict.ts";

function isUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export class CourseService {
  private courseRepository: CourseRepository;

  constructor(pool: Pool = sharedPool) {
    this.courseRepository = new CourseRepository(pool);
  }

  async getAllCourses(): Promise<Course[]> {
    return this.courseRepository.getAll();
  }

  async createCourse(courseData: CourseCreateDTO): Promise<Course> {
    try {
      return await this.courseRepository.create(courseData);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError("Course code already exists");
      }
      throw error;
    }
  }

  async updateCourse(
    id: number,
    courseData: CourseUpdateDTO,
  ): Promise<Course> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError("Course id must be a positive integer");
    }

    const course = await this.courseRepository.update(id, courseData);
    if (!course) {
      throw new NotFoundError("Course not found");
    }
    return course;
  }

  async deleteCourse(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError("Course id must be a positive integer");
    }
    await this.courseRepository.delete(String(id));
  }
}
