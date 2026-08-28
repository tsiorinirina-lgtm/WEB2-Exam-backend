import { StudentRepository } from "../repositories/StudentRepository.ts";
import { pool } from "../config/database.ts";
import type { Student } from "../models/Student.ts";

export class StudentService {
  private studentRepository: StudentRepository;

  constructor() {
    this.studentRepository = new StudentRepository(pool);
  }

  getAll = async (): Promise<Student[]> => {
    try {
      return await this.studentRepository.getAllStudents();
    } catch (error) {
      throw error;
    }
  };

  create = async (studentData: Student): Promise<Student> => {
    try {
      return await this.studentRepository.createStudent(studentData);
    } catch (error) {
      throw error;
    }
  };
}
