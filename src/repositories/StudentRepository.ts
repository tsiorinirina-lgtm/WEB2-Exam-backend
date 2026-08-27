import type { Pool, QueryResult } from "pg";
import type { User } from "../models/User.ts";

interface UserRow {
  id: number;
  mail: string;
  firstname: string;
  lastname: string;
  password_hash: string;
  is_active: boolean;
  joined_at: Date;
  role: User["role"];
}

export class StudentRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }
  getAllStudents = async (): Promise<User[]> => {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<UserRow> = await client.query<UserRow>(
        "SELECT id, mail, firstname, lastname, password_hash, is_active, joined_at, role FROM users WHERE role = 'student'",
      );
      return result.rows.map((row) => this.toUser(row));
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  getStudentById = async (id: number): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<UserRow> = await client.query<UserRow>(
        "SELECT id, mail, firstname, lastname, password_hash, is_active, joined_at, role FROM users WHERE id = $1 AND role = 'student'",
        [id],
      );
      return this.toUser(result.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  getStudentByEmail = async (email: string): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<UserRow> = await client.query<UserRow>(
        "SELECT id, mail, firstname, lastname, password_hash, is_active, joined_at, role FROM users WHERE mail = $1 AND role = 'student'",
        [email],
      );
      return this.toUser(result.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  createStudent = async (user: User): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<UserRow> = await client.query<UserRow>(
        "INSERT INTO users (mail, firstname, lastname, password_hash, role) VALUES ($1, $2, $3, $4, 'student') RETURNING id, mail, firstname, lastname, password_hash, is_active, joined_at, role",
        [
          user.email,
          user.name.split(" ")[0],
          user.name.split(" ").slice(1).join(" "),
          user.password,
        ],
      );
      return this.toUser(result.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  updateStudent = async (id: number, user: User): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<UserRow> = await client.query<UserRow>(
        "UPDATE users SET mail = $1, firstname = $2, lastname = $3, password_hash = $4, is_active = $5 WHERE id = $6 AND role = 'student' RETURNING id, mail, firstname, lastname, password_hash, is_active, joined_at, role",
        [
          user.email,
          user.name.split(" ")[0],
          user.name.split(" ").slice(1).join(" "),
          user.password,
          user.isActive,
          id,
        ],
      );
      return this.toUser(result.rows[0]);
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

  private toUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.mail,
      name: `${row.firstname} ${row.lastname}`,
      password: row.password_hash,
      isActive: row.is_active,
      joinedAt: row.joined_at,
      role: row.role,
    };
  }
}
