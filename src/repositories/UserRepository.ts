import type { Pool } from "pg";
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

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.mail,
    name: `${row.firstname} ${row.lastname}`,
    password: row.password_hash,
    isActive: row.is_active,
    createdAt: row.joined_at,
    role: row.role,
  };
}

export class UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  findById = async (id: number): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const result = await client.query<UserRow>(
        `SELECT id, mail, firstname, lastname, password_hash,
                is_active, joined_at, role
         FROM users WHERE id = $1`,
        [id],
      );
      return mapRow(result.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  findByMail = async (email: string): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const result = await client.query<UserRow>(
        `SELECT id, mail, firstname, lastname, password_hash,
                is_active, joined_at, role
         FROM users WHERE mail = $1`,
        [email],
      );
      return mapRow(result.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
}
