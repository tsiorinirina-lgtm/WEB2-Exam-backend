import { ExamRepository } from "../repositories/ExamRepository.ts";
import { pool } from "../config/database.ts";
import type { Exam } from "../models/Exam.ts";
import { BadRequestError } from "../errors/BadRequest.ts";
import { NotFoundError } from "../errors/NotFound.ts";

export class ExamService {
  private examRepository: ExamRepository;

  constructor() {
    this.examRepository = new ExamRepository(pool);
  }

  async getAll(): Promise<Exam[]> {
    return this.examRepository.findAll();
  }

  async getById(id: number): Promise<Exam> {
    this.validateId(id);
    const exam = await this.examRepository.findById(id);
    if (!exam) {
      throw new NotFoundError("Exam not found");
    }
    return exam;
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError("Exam id must be a positive integer");
    }
  }
}
