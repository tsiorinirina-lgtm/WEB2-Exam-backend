import { Pool } from "pg";
import { AttemptRepository } from "../repositories/AttemptRepository.ts";
import { QuestionRepository } from "../repositories/QuestionRepository.ts";
import type { MyExam } from "../models/StudentExam.ts";

export class MyService {
  private pool: Pool;
  private attemptRepository: AttemptRepository;
  private questionRepository: QuestionRepository;

  constructor(pool = new Pool()) {
    this.pool = pool;
    this.attemptRepository = new AttemptRepository(pool);
    this.questionRepository = new QuestionRepository(pool);
  }

  async getAvailableExams(userId: number): Promise<MyExam[]> {
    const result = await this.pool.query(
      `SELECT
         e.id,
         e.title,
         e.description,
         e.ends_at,
         c.code AS course_code,
         c.name AS course_name,
         COUNT(q.id)::int AS question_count,
         COALESCE(SUM(q.points), 0)::int AS total_points
       FROM exams e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN questions q ON q.exam_id = e.id
       LEFT JOIN attempts a
         ON a.exam_id = e.id AND a.user_id = $1
       WHERE e.starts_at <= now()
         AND e.ends_at >= now()
         AND a.id IS NULL
       GROUP BY e.id, c.code, c.name
       ORDER BY e.ends_at ASC, e.id ASC`,
      [userId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      course: { code: row.course_code, name: row.course_name },
      description: row.description,
      endsAt: new Date(row.ends_at),
      questionCount: Number(row.question_count),
      totalPoints: Number(row.total_points),
    }));
  }
}
