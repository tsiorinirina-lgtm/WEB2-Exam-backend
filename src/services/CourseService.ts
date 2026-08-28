import { Pool } from "pg";
import { CourseRepository } from "../repositories/CourseRepository.ts";
import type { Course } from "../models/Course.ts";

export class CourseService {
  private courseRepository: CourseRepository;

  constructor(pool = new Pool()) {
    this.courseRepository = new CourseRepository(pool);
  }

  async getAllCourses(): Promise<Course[]> {
    return this.courseRepository.getAll();
  }
}
