import { ExamRepository } from "../repositories/ExamRepository.ts";
import { pool } from "../config/database.ts";

export class ExamService {
  private examRepository: ExamRepository;

  constructor() {
    this.examRepository = new ExamRepository(pool);
  }
}
