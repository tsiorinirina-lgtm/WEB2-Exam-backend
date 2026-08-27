import { Pool, QueryResult } from 'pg';
import type{ Question, QuestionInput } from '../models/Question.js';
import type { Choice, ChoiceInput } from '../models/Choice.js';

export class QuestionRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private mapQuestionRow(row: any): Question {
        return {
            id: row.id,
            statement: row.statement,
            examId: row.exam_id,
            points: parseInt(row.points),
            position: parseInt(row.position),
            choices: row.choices || []
        };
    }

    private mapChoiceRow(row: any): Choice {
        return {
            id: row.id,
            text: row.text,
            isCorrect: row.is_correct
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

        const questionResult: QueryResult = await this.pool.query(questionQuery, [examId]);
        
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

        const choiceResult: QueryResult = await this.pool.query(choiceQuery, [questionIds]);

        const choicesByQuestion = new Map<number, Choice[]>();
        choiceResult.rows.forEach(row => {
            const choice = this.mapChoiceRow(row);
            if (!isAdmin) {
                delete (choice as any).isCorrect;
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

        const questionResult: QueryResult = await this.pool.query(questionQuery, [id]);
        
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

        const choiceResult: QueryResult = await this.pool.query(choiceQuery, [id]);
        question.choices = choiceResult.rows.map(row => this.mapChoiceRow(row));

        return question;
    }

    async create(examId: number, questionData: QuestionInput): Promise<Question> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            if (questionData.choices.length < 2 || questionData.choices.length > 6) {
                throw new Error('Question must have between 2 and 6 choices (RG-04)');
            }

            const correctChoices = questionData.choices.filter(c => c.isCorrect);
            if (correctChoices.length !== 1) {
                throw new Error('Question must have exactly one correct choice (RG-04)');
            }

            const insertQuestionQuery = `
                INSERT INTO questions (exam_id, statement, points, position)
                VALUES ($1, $2, $3, $4)
                RETURNING id, exam_id, statement, points, position
            `;

            const points = questionData.points || 1;
            const position = questionData.position || 1;

            const questionResult: QueryResult = await client.query(insertQuestionQuery, [
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

                const choiceResult: QueryResult = await client.query(insertChoiceQuery, [
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
}