import { StudentRepository } from "../repositories/StudentRepository.ts";
import { pool } from "../config/database.ts";

export class StudentService {
  private studentRepository: StudentRepository;

  constructor(studentRepository: StudentRepository) {
    this.studentRepository = new StudentRepository(pool);
  }
}
