import { ExamRepository } from "../repositories/ExamRepository.ts";
import { pool } from "../config/database.ts";
import type { Exam } from "../models/Exam.ts";

export class ExamService {
  private examRepository: ExamRepository;

  constructor() {
    this.examRepository = new ExamRepository(pool);
  }

  async getAll(): Promise<Exam[]> {
    return this.examRepository.findAll();
  }
}
