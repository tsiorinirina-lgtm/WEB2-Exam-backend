import type { Pool, QueryResult } from "pg";
import type { Choice, ChoiceInput } from "../models/Choice.ts";

interface ChoiceRow {
  id: number;
  text: string;
  is_correct: boolean;
  question_id: number;
}

export class ChoiceRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findByQuestionId(questionId: number): Promise<Choice[]> {
    const result: QueryResult<ChoiceRow> = await this.pool.query(
      `SELECT id, text, is_correct, question_id
       FROM choices
       WHERE question_id = $1
       ORDER BY id ASC`,
      [questionId],
    );

    return result.rows.map((row) => this.toChoice(row));
  }

  async findById(id: number): Promise<Choice | null> {
    const result: QueryResult<ChoiceRow> = await this.pool.query(
      `SELECT id, text, is_correct, question_id
       FROM choices
       WHERE id = $1`,
      [id],
    );

    return result.rows.length > 0 ? this.toChoice(result.rows[0]) : null;
  }

  async create(questionId: number, choiceData: ChoiceInput): Promise<Choice> {
    const result: QueryResult<ChoiceRow> = await this.pool.query(
      `INSERT INTO choices (question_id, text, is_correct)
       VALUES ($1, $2, $3)
       RETURNING id, text, is_correct, question_id`,
      [questionId, choiceData.text, choiceData.isCorrect],
    );

    return this.toChoice(result.rows[0]);
  }

  async update(
    id: number,
    choiceData: Partial<ChoiceInput>,
  ): Promise<Choice | null> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (choiceData.text !== undefined) {
      values.push(choiceData.text);
      updates.push(`text = $${values.length}`);
    }

    if (choiceData.isCorrect !== undefined) {
      values.push(choiceData.isCorrect);
      updates.push(`is_correct = $${values.length}`);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result: QueryResult<ChoiceRow> = await this.pool.query(
      `UPDATE choices
       SET ${updates.join(", ")}
       WHERE id = $${values.length}
       RETURNING id, text, is_correct, question_id`,
      values,
    );

    return result.rows.length > 0 ? this.toChoice(result.rows[0]) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM choices WHERE id = $1 RETURNING id",
      [id],
    );
    return result.rows.length > 0;
  }

  async deleteByQuestionId(questionId: number): Promise<void> {
    await this.pool.query("DELETE FROM choices WHERE question_id = $1", [
      questionId,
    ]);
  }

  async belongsToQuestion(id: number, questionId: number): Promise<boolean> {
    const result: QueryResult<{ exists: boolean }> = await this.pool.query(
      `SELECT EXISTS(
         SELECT 1
         FROM choices
         WHERE id = $1 AND question_id = $2
       ) AS exists`,
      [id, questionId],
    );
    return result.rows[0].exists;
  }

  private toChoice(row: ChoiceRow): Choice {
    return {
      id: String(row.id),
      text: row.text,
      isCorrect: row.is_correct,
      questionId: String(row.question_id),
    };
  }
}
