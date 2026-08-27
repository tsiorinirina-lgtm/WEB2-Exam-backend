import { pool } from "../config/database.ts";
import { User } from "../models/User.ts";

export class StudentRepository {
  getAllStudents = async (): Promise<User[]> => {
    const client = await pool.connect();
    try {
      const result = await client.queryObject<User[]>(
        "SELECT * FROM users WHERE role = 'student'",
      );
      return result.rows;
    } finally {
      client.release();
    }
  };
}
