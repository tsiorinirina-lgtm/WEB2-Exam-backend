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
}