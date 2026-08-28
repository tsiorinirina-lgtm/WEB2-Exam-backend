import { Pool } from 'pg';
import type { QueryResult } from 'pg';
import type{ Question, QuestionInput } from '../models/Question.js';
import type { Choice } from '../models/Choice.js';

interface QuestionRow {
    id: number;
    statement: string;
    exam_id: number;
    points: number | string;
    position: number | string;
    choices?: Choice[];
}

interface ChoiceRow {
    id: number;
    text: string;
    is_correct: boolean;
    question_id: number;
}

export class QuestionRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private mapQuestionRow(row: QuestionRow): Question {
        return {
            id: row.id,
            statement: row.statement,
            examId: String(row.exam_id),
            points: Number(row.points),
            position: Number(row.position),
            choices: row.choices || []
        };
    }

    private mapChoiceRow(row: ChoiceRow): Choice {
        return {
            id: String(row.id),
            text: row.text,
            isCorrect: row.is_correct,
            questionId: String(row.question_id),
        };
    }

    async findByExamId(examId: number, isAdmin: boolean = false): Promise<Question[]> {
        const questionQuery = `
            SELECT 
                id,
                exam_id,
                statement,
                points,
                position
            FROM questions
            WHERE exam_id = $1
            ORDER BY position ASC, id ASC
        `;

        const questionResult: QueryResult<QuestionRow> = await this.pool.query(questionQuery, [examId]);
        
        if (questionResult.rows.length === 0) {
            return [];
        }

        const questionIds = questionResult.rows.map(row => row.id);
        const choiceQuery = `
            SELECT 
                id,
                question_id,
                text,
                is_correct
            FROM choices
            WHERE question_id = ANY($1::int[])
            ORDER BY id ASC
        `;

        const choiceResult: QueryResult<ChoiceRow> = await this.pool.query(choiceQuery, [questionIds]);

        const choicesByQuestion = new Map<number, Choice[]>();
        choiceResult.rows.forEach(row => {
            const choice = this.mapChoiceRow(row);
            if (!isAdmin) {
                delete choice.isCorrect;
            }
            
            if (!choicesByQuestion.has(row.question_id)) {
                choicesByQuestion.set(row.question_id, []);
            }
            choicesByQuestion.get(row.question_id)!.push(choice);
        });

        return questionResult.rows.map(row => {
            const question = this.mapQuestionRow(row);
            question.choices = choicesByQuestion.get(row.id) || [];
            return question;
        });
    }

    async findById(id: number): Promise<Question | null> {
        const questionQuery = `
            SELECT 
                id,
                exam_id,
                statement,
                points,
                position
            FROM questions
            WHERE id = $1
        `;

        const questionResult: QueryResult<QuestionRow> = await this.pool.query(questionQuery, [id]);
        
        if (questionResult.rows.length === 0) {
            return null;
        }

        const question = this.mapQuestionRow(questionResult.rows[0]);

        const choiceQuery = `
            SELECT 
                id,
                question_id,
                text,
                is_correct
            FROM choices
            WHERE question_id = $1
            ORDER BY id ASC
        `;

        const choiceResult: QueryResult<ChoiceRow> = await this.pool.query(choiceQuery, [id]);
        question.choices = choiceResult.rows.map(row => this.mapChoiceRow(row));

        return question;
    }

    async create(examId: number, questionData: QuestionInput): Promise<Question> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            if (questionData.choices.length < 2 || questionData.choices.length > 6) {
                throw new Error('Question must have between 2 and 6 choices');
            }

            const correctChoices = questionData.choices.filter(c => c.isCorrect);
            if (correctChoices.length !== 1) {
                throw new Error('Question must have exactly one correct choice');
            }

            const insertQuestionQuery = `
                INSERT INTO questions (exam_id, statement, points, position)
                VALUES ($1, $2, $3, $4)
                RETURNING id, exam_id, statement, points, position
            `;

            const points = questionData.points || 1;
            const position = questionData.position || 1;

            const questionResult: QueryResult<QuestionRow> = await client.query(insertQuestionQuery, [
                examId,
                questionData.statement,
                points,
                position
            ]);

            const question = this.mapQuestionRow(questionResult.rows[0]);

            const insertedChoices: Choice[] = [];
            for (const choiceInput of questionData.choices) {
                const insertChoiceQuery = `
                    INSERT INTO choices (question_id, text, is_correct)
                    VALUES ($1, $2, $3)
                    RETURNING id, text, is_correct
                `;

                const choiceResult: QueryResult<ChoiceRow> = await client.query(insertChoiceQuery, [
                    question.id,
                    choiceInput.text,
                    choiceInput.isCorrect
                ]);

                insertedChoices.push(this.mapChoiceRow(choiceResult.rows[0]));
            }

            question.choices = insertedChoices;

            await client.query('COMMIT');
            return question;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async update(id: number, questionData: Partial<QuestionInput>): Promise<Question | null> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            const checkQuery = 'SELECT id FROM questions WHERE id = $1';
            const checkResult = await client.query(checkQuery, [id]);
            if (checkResult.rows.length === 0) {
                return null;
            }

            const updates: string[] = [];
            const values: unknown[] = [];
            let paramIndex = 1;

            if (questionData.statement !== undefined) {
                updates.push(`statement = $${paramIndex}`);
                values.push(questionData.statement);
                paramIndex++;
            }

            if (questionData.points !== undefined) {
                updates.push(`points = $${paramIndex}`);
                values.push(questionData.points);
                paramIndex++;
            }

            if (questionData.position !== undefined) {
                updates.push(`position = $${paramIndex}`);
                values.push(questionData.position);
                paramIndex++;
            }

            if (updates.length > 0) {
                values.push(id);
                const updateQuery = `
                    UPDATE questions
                    SET ${updates.join(', ')}
                    WHERE id = $${paramIndex}
                `;
                await client.query(updateQuery, values);
            }

            if (questionData.choices !== undefined) {
                if (questionData.choices.length < 2 || questionData.choices.length > 6) {
                    throw new Error('Question must have between 2 and 6 choices');
                }

                const correctChoices = questionData.choices.filter(c => c.isCorrect);
                if (correctChoices.length !== 1) {
                    throw new Error('Question must have exactly one correct choice');
                }

                const deleteChoicesQuery = 'DELETE FROM choices WHERE question_id = $1';
                await client.query(deleteChoicesQuery, [id]);

                for (const choiceInput of questionData.choices) {
                    const insertChoiceQuery = `
                        INSERT INTO choices (question_id, text, is_correct)
                        VALUES ($1, $2, $3)
                    `;
                    await client.query(insertChoiceQuery, [
                        id, 
                        choiceInput.text, 
                        choiceInput.isCorrect
                    ]);
                }
            }

            await client.query('COMMIT');
            return await this.findById(id);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async delete(id: number): Promise<boolean> {
        const deleteQuery = `
            DELETE FROM questions
            WHERE id = $1
            RETURNING id
        `;

        const result: QueryResult = await this.pool.query(deleteQuery, [id]);
        return result.rows.length > 0;
    }

    async deleteByExamId(examId: number): Promise<void> {
        const deleteQuery = `
            DELETE FROM questions
            WHERE exam_id = $1
        `;

        await this.pool.query(deleteQuery, [examId]);
    }

    async getQuestionCount(examId: number): Promise<number> {
        const query = `
            SELECT COUNT(*) as count
            FROM questions
            WHERE exam_id = $1
        `;

        const result: QueryResult = await this.pool.query(query, [examId]);
        return parseInt(result.rows[0].count);
    }

    async getTotalPoints(examId: number): Promise<number> {
        const query = `
            SELECT COALESCE(SUM(points), 0) as total
            FROM questions
            WHERE exam_id = $1
        `;

        const result: QueryResult = await this.pool.query(query, [examId]);
        return parseInt(result.rows[0].total);
    }

    async exists(id: number): Promise<boolean> {
        const query = `
            SELECT EXISTS(
                SELECT 1 FROM questions WHERE id = $1
            ) as exists
        `;

        const result: QueryResult = await this.pool.query(query, [id]);
        return result.rows[0].exists;
    }
}
