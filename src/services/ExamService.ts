import { ExamRepository } from "../repositories/ExamRepository.ts";
import { pool } from "../config/database.ts";
import type { Exam, ExamInput } from "../models/Exam.ts";
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

  async create(examData: ExamInput): Promise<Exam> {
    this.validateExamData(examData);
    return this.examRepository.create(examData);
  }

  async update(
    id: number,
    examData: Partial<ExamInput>,
  ): Promise<Exam> {
    this.validateId(id);
    const currentExam = await this.getById(id);
    const mergedData: ExamInput = {
      courseId: examData.courseId ?? currentExam.course.id,
      title: examData.title ?? currentExam.title,
      description:
        examData.description === undefined
          ? currentExam.description
          : examData.description,
      startsAt: examData.startsAt ?? currentExam.startsAt,
      endsAt: examData.endsAt ?? currentExam.endsAt,
    };
    this.validateExamData(mergedData);

    const updatedExam = await this.examRepository.update(id, examData);
    if (!updatedExam) {
      throw new NotFoundError("Exam not found");
    }
    return updatedExam;
  }

  async delete(id: number): Promise<boolean> {
    this.validateId(id);
    await this.getById(id);
    return this.examRepository.delete(id);
  }

  async getResults(id: number): Promise<unknown> {
    this.validateId(id);
    await this.getById(id);
    return this.examRepository.getResults(id);
  }

  private validateExamData(examData: ExamInput): void {
    if (
      !examData ||
      !Number.isInteger(examData.courseId) ||
      examData.courseId <= 0 ||
      typeof examData.title !== "string" ||
      examData.title.trim().length === 0
    ) {
      throw new BadRequestError("Course, title, and dates are required");
    }

    const startsAt = new Date(examData.startsAt);
    const endsAt = new Date(examData.endsAt);
    if (
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime()) ||
      endsAt <= startsAt
    ) {
      throw new BadRequestError("End date must be after start date");
    }
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError("Exam id must be a positive integer");
    }
  }
}
