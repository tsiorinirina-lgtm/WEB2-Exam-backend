import type { Pool } from "pg";
import type { User } from "../models/User.ts";

export class StudentRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }
  getAllStudents = async (): Promise<User[]> => {
    const client = await this.pool.connect();
    try {
      const result = await client.query<User>(
        "SELECT * FROM users WHERE role = 'student'",
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  getStudentById = async (id: number): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const result = await client.query<User>(
        "SELECT * FROM users WHERE id = $1 AND role = 'student'",
        [id],
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  getStudentByEmail = async (email: string): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const result = await client.query<User>(
        "SELECT * FROM users WHERE email = $1 AND role = 'student'",
        [email],
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  createStudent = async (user: User): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const result = await client.query<User>(
        "INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, 'student') RETURNING *",
        [user.email, user.name, user.password],
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  updateStudent = async (id: number, user: User): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const result = await client.query<User>(
        "UPDATE users SET email = $1, name = $2, password = $3, is_active = $4 WHERE id = $5 AND role = 'student' RETURNING *",
        [user.email, user.name, user.password, user.isActive, id],
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  deleteStudent = async (id: number): Promise<void> => {
    const client = await this.pool.connect();
    try {
      await client.query(
        "UPDATE users SET is_active = false WHERE id = $1 AND role = 'student' RETURNING *",
        [id],
      );
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
}
