import { StudentRepository } from "../repositories/StudentRepository.ts";
import { pool } from "../config/database.ts";
import type { User } from "../models/User.ts";

export class StudentService {
  private studentRepository: StudentRepository;

  constructor() {
    this.studentRepository = new StudentRepository(pool);
  }

  getAll = async (): Promise<User[]> => {
    try {
      return await this.studentRepository.getAllStudents();
    } catch (error) {
      throw error;
    }
  };

  create = async (studentData: User): Promise<User> => {
    try {
      return await this.studentRepository.createStudent(studentData);
    } catch (error) {
      throw error;
    }
  };
}
