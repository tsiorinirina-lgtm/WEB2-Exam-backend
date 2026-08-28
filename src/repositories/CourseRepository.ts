import type { Pool, QueryResult } from "pg";
import type {
  Course,
  CourseCreateDTO,
  CourseUpdateDTO,
} from "../models/Course.ts";

interface CourseRow {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export class CourseRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  getAll = async (): Promise<Course[]> => {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<CourseRow> = await client.query(
        "SELECT id, code, name, description FROM courses",
      );
      return result.rows.map((row) => this.toCourse(row));
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  create = async (courseData: CourseCreateDTO): Promise<Course> => {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<CourseRow> = await client.query(
        "INSERT INTO courses (code, name, description) VALUES ($1, $2, $3) RETURNING id, code, name, description",
        [courseData.code, courseData.name, courseData.description],
      );
      return this.toCourse(result.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  update = async (
    id: number,
    courseData: CourseUpdateDTO,
  ): Promise<Course | null> => {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<CourseRow> = await client.query(
        `UPDATE courses
         SET code = $1, name = $2, description = $3
         WHERE id = $4
         RETURNING id, code, name, description`,
        [courseData.code, courseData.name, courseData.description ?? null, id],
      );
      return result.rows.length > 0 ? this.toCourse(result.rows[0]) : null;
    } finally {
      client.release();
    }
  };

  delete = async (id: string): Promise<void> => {
    const client = await this.pool.connect();
    try {
      await client.query("DELETE FROM courses WHERE id = $1", [id]);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };

  private toCourse(row: CourseRow): Course {
    return {
      id: String(row.id),
      code: row.code,
      name: row.name,
      description: row.description,
    };
  }
}
