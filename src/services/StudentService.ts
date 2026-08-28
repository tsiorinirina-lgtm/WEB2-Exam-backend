import bcrypt from "bcrypt";
import { StudentRepository } from "../repositories/StudentRepository.ts";
import { pool } from "../config/database.ts";
import type { User, UserCreateDTO, UserUpdateDTO } from "../models/User.ts";

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

  create = async (studentData: UserCreateDTO): Promise<User> => {
    try {
      const password = await bcrypt.hash(
        studentData.password,
        Number(process.env.SALT_ROUNDS ?? 10),
      );
      return await this.studentRepository.createStudent({
        ...studentData,
        password,
        role: "student",
      });
    } catch (error) {
      throw error;
    }
  };
}
