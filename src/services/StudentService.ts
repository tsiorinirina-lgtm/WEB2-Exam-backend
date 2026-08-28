import bcrypt from "bcrypt";
import { StudentRepository } from "../repositories/StudentRepository.ts";
import { pool } from "../config/database.ts";
import type { PublicUser, UserCreateDTO, UserUpdateDTO } from "../models/User.ts";

export class StudentService {
  private studentRepository: StudentRepository;

  constructor() {
    this.studentRepository = new StudentRepository(pool);
  }

  getAll = async (): Promise<PublicUser[]> => {
    try {
      return await this.studentRepository.getAllStudents();
    } catch (error) {
      throw error;
    }
  };

  create = async (studentData: UserCreateDTO): Promise<PublicUser> => {
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

  update = async (id: number, studentData: UserUpdateDTO): Promise<PublicUser> => {
    const existingStudent = await this.studentRepository.getStudentById(id);
    let password = studentData.password;

    if (password !== undefined) {
      password = await bcrypt.hash(
        password,
        Number(process.env.SALT_ROUNDS ?? 10),
      );
    }

    return this.studentRepository.updateStudent(id, {
      ...studentData,
      password,
      email: studentData.email ?? existingStudent.email,
      name: studentData.name ?? existingStudent.name,
      isActive: studentData.isActive ?? existingStudent.isActive,
    });
  };

  delete = async (id: number): Promise<PublicUser> => {
    await this.studentRepository.deleteStudent(id);
    return this.studentRepository.getStudentById(id);
  };
}
