import { Pool } from "pg";
import { CourseRepository } from "../repositories/CourseRepository.ts";

export class CourseService {
  private courseRepository: CourseRepository;

  constructor(pool = new Pool()) {
    this.courseRepository = new CourseRepository(pool);
  }
}
