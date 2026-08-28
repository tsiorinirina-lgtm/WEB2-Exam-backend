import type { Pool, QueryResult } from "pg";
import type { PublicUser, User, UserCreateDTO, UserUpdateDTO } from "../models/User.ts";

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
  getAllStudents = async (): Promise<PublicUser[]> => {
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

  getStudentById = async (id: number): Promise<PublicUser> => {
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

  getStudentByEmail = async (email: string): Promise<PublicUser> => {
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

  createStudent = async (user: UserCreateDTO): Promise<PublicUser> => {
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

  updateStudent = async (id: number, user: UserUpdateDTO): Promise<PublicUser> => {
    const client = await this.pool.connect();
    try {
      const updates: string[] = [];
      const values: unknown[] = [];
      if (user.email !== undefined) {
        values.push(user.email);
        updates.push(`mail = $${values.length}`);
      }
      if (user.name !== undefined) {
        const parts = user.name.trim().split(/\s+/);
        values.push(parts[0]);
        updates.push(`firstname = $${values.length}`);
        values.push(parts.slice(1).join(" "));
        updates.push(`lastname = $${values.length}`);
      }
      if (user.password !== undefined) {
        values.push(user.password);
        updates.push(`password_hash = $${values.length}`);
      }
      if (user.isActive !== undefined) {
        values.push(user.isActive);
        updates.push(`is_active = $${values.length}`);
      }
      if (updates.length === 0) {
        return this.getStudentById(id);
      }
      values.push(id, "student");
      const result: QueryResult<UserRow> = await client.query<UserRow>(
        `UPDATE users SET ${updates.join(", ")}
         WHERE id = $${values.length - 1} AND role = $${values.length}
         RETURNING id, mail, firstname, lastname, password_hash, is_active, joined_at, role`,
        values,
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

  private toUser(row: UserRow): PublicUser {
    return {
      id: row.id,
      email: row.mail,
      name: `${row.firstname} ${row.lastname}`,
      isActive: row.is_active,
      joinedAt: row.joined_at,
      role: row.role,
    };
  }
}
