import type { Pool, QueryResult } from "pg";
import type { AnswerCreateDTO } from "../models/Answer.ts";
import type {
  Attempt,
  AttemptCreateDTO,
  AttemptRow,
} from "../models/Attempt.ts";
import type {
  CorrectionLine,
  ExamCorrectionRow,
  SubmitAnswerInput,
  SubmitExamResult,
} from "../models/StudentExam.ts";
import type {
  ExamResultLine,
  ExamResults,
  MyResultLine,
  ResultRow,
} from "../models/Result.ts";

export class AttemptRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(
    attemptData: AttemptCreateDTO,
    answers: AnswerCreateDTO[],
  ): Promise<Attempt> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const result: QueryResult<AttemptRow> = await client.query(
        `INSERT INTO attempts (exam_id, user_id, score)
         VALUES ($1, $2, $3)
         RETURNING id, submitted_at, score, exam_id, user_id`,
        [attemptData.examId, attemptData.userId, attemptData.score],
      );

      for (const answer of answers) {
        await client.query(
          `INSERT INTO answers (attempt_id, exam_id, question_id, choice_id)
           VALUES ($1, $2, $3, $4)`,
          [
            result.rows[0].id,
            answer.examId,
            answer.questionId,
            answer.choiceId,
          ],
        );
      }

      await client.query("COMMIT");
      return this.toAttempt(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findByExamAndUser(
    examId: string,
    userId: string,
  ): Promise<Attempt | null> {
    const result: QueryResult<AttemptRow> = await this.pool.query(
      `SELECT id, submitted_at, score, exam_id, user_id
       FROM attempts
       WHERE exam_id = $1 AND user_id = $2`,
      [examId, userId],
    );

    return result.rows.length > 0 ? this.toAttempt(result.rows[0]) : null;
  }

  async submit(
    examId: number,
    userId: number,
    submittedAnswers: SubmitAnswerInput[],
  ): Promise<SubmitExamResult> {
    const client = await this.pool.connect();
    const answersJson = JSON.stringify(
      submittedAnswers.map((a) => ({
        question_id: a.questionId,
        choice_id: a.choiceId,
      })),
    );

    try {
      await client.query("BEGIN");

      const examResult: QueryResult<ExamCorrectionRow> = await client.query(
        `SELECT
           q.id AS question_id,
           q.statement,
           q.points,
           correct_choice.id AS correct_choice_id,
           submitted_choice.id AS choice_id
         FROM questions q
         JOIN choices correct_choice
           ON correct_choice.question_id = q.id
          AND correct_choice.is_correct = true
         LEFT JOIN choices submitted_choice
           ON submitted_choice.question_id = q.id
          AND submitted_choice.id = (
            SELECT answer.choice_id
            FROM jsonb_to_recordset($2::jsonb)
              AS answer(question_id int, choice_id int)
            WHERE answer.question_id = q.id
          )
         WHERE q.exam_id = $1
         ORDER BY q.position ASC, q.id ASC`,
        [examId, answersJson],
      );

      const questionIds = new Set(
        examResult.rows.map((row) => row.question_id),
      );
      const submittedQuestionIds = new Set<number>();
      for (const answer of submittedAnswers) {
        if (submittedQuestionIds.has(answer.questionId)) {
          throw new Error("Duplicate question_id");
        }
        if (!questionIds.has(answer.questionId)) {
          throw new Error("Question does not belong to exam");
        }
        submittedQuestionIds.add(answer.questionId);
      }

      const choiceValidation: QueryResult<{ question_id: number }> =
        await client.query(
          `SELECT question_id
           FROM choices
           WHERE (question_id, id) IN (
             SELECT question_id, choice_id
             FROM jsonb_to_recordset($1::jsonb)
               AS answer(question_id int, choice_id int)
           )`,
          [answersJson],
        );
      if (choiceValidation.rows.length !== submittedAnswers.length) {
        throw new Error("Choice does not belong to question");
      }

      const correction: CorrectionLine[] = examResult.rows.map((row) => {
        const isCorrect = row.choice_id === row.correct_choice_id;
        return {
          questionId: row.question_id,
          statement: row.statement,
          points: Number(row.points),
          studentChoiceId: row.choice_id,
          correctChoiceId: row.correct_choice_id,
          isCorrect,
        };
      });
      const score = correction.reduce(
        (total, line) => total + (line.isCorrect ? line.points : 0),
        0,
      );
      const totalPoints = correction.reduce(
        (total, line) => total + line.points,
        0,
      );

      const attemptResult: QueryResult<AttemptRow> = await client.query(
        `INSERT INTO attempts (exam_id, user_id, score)
         VALUES ($1, $2, $3)
         RETURNING id, submitted_at, score, exam_id, user_id`,
        [examId, userId, score],
      );

      for (const line of correction) {
        await client.query(
          `INSERT INTO answers (attempt_id, exam_id, question_id, choice_id)
           VALUES ($1, $2, $3, $4)`,
          [
            attemptResult.rows[0].id,
            examId,
            line.questionId,
            line.studentChoiceId,
          ],
        );
      }

      await client.query("COMMIT");
      return { score, totalPoints, correction };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findResultsByUser(userId: number): Promise<MyResultLine[]> {
    const result: QueryResult<ResultRow> = await this.pool.query(
      `SELECT
         a.exam_id,
         e.title,
         c.code AS course_code,
         a.score,
         COALESCE(SUM(q.points), 0) AS total_points,
         a.submitted_at
       FROM attempts a
       JOIN exams e ON e.id = a.exam_id
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN questions q ON q.exam_id = e.id
       WHERE a.user_id = $1
       GROUP BY a.id, e.id, c.code
       ORDER BY a.submitted_at DESC`,
      [userId],
    );

    return result.rows.map((row) => ({
      examId: row.exam_id,
      title: row.title,
      courseCode: row.course_code,
      score: Number(row.score),
      totalPoints: Number(row.total_points),
      submittedAt: row.submitted_at,
    }));
  }

  async findResultsByExam(examId: number): Promise<ExamResults> {
    const result: QueryResult<{
      student_id: number;
      student_name: string;
      score: number;
      submitted_at: Date;
    }> = await this.pool.query(
      `SELECT
         u.id AS student_id,
         CONCAT(u.firstname, ' ', u.lastname) AS student_name,
         a.score,
         a.submitted_at
       FROM attempts a
       JOIN users u ON u.id = a.user_id
       WHERE a.exam_id = $1
       ORDER BY a.score DESC, a.submitted_at ASC`,
      [examId],
    );
    const totalPointsResult: QueryResult<{ total_points: number }> =
      await this.pool.query(
        `SELECT COALESCE(SUM(points), 0) AS total_points
         FROM questions
         WHERE exam_id = $1`,
        [examId],
      );
    const examResult: QueryResult<{ id: number; title: string }> =
      await this.pool.query("SELECT id, title FROM exams WHERE id = $1", [
        examId,
      ]);

    const results: ExamResultLine[] = result.rows.map((row) => ({
      studentId: row.student_id,
      name: row.student_name,
      score: Number(row.score),
      submittedAt: row.submitted_at,
    }));
    const average =
      results.length === 0
        ? null
        : results.reduce((sum, row) => sum + row.score, 0) / results.length;

    return {
      exam: examResult.rows[0],
      totalPoints: Number(totalPointsResult.rows[0].total_points),
      average,
      attemptCount: results.length,
      results,
    };
  }

  private toAttempt(row: AttemptRow): Attempt {
    return {
      id: String(row.id),
      submittedAt: row.submitted_at,
      score: Number(row.score),
      examId: String(row.exam_id),
      userId: String(row.user_id),
    };
  }
}
