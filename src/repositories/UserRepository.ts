import type { Pool } from "pg";
import type { User } from "../models/User.ts";

export class UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  findById = async (id: number): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const user = await client.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      return user.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  findByMail = async (email: string): Promise<User> => {
    const client = await this.pool.connect();
    try {
      const user = await client.query("SELECT * FROM users WHERE mail = $1", [
        email,
      ]);
      return user.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
}
