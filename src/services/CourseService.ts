import { Pool } from "pg";
import { CourseRepository } from "../repositories/CourseRepository.ts";
import type {
  Course,
  CourseCreateDTO,
  CourseUpdateDTO,
} from "../models/Course.ts";
import { BadRequestError } from "../errors/BadRequest.ts";
import { NotFoundError } from "../errors/NotFound.ts";

export class CourseService {
  private courseRepository: CourseRepository;

  constructor(pool = new Pool()) {
    this.courseRepository = new CourseRepository(pool);
  }

  async getAllCourses(): Promise<Course[]> {
    return this.courseRepository.getAll();
  }

  async createCourse(courseData: CourseCreateDTO): Promise<Course> {
    return this.courseRepository.create(courseData);
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
}
