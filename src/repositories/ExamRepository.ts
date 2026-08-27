import { Pool, QueryResult } from 'pg';
import type { Exam, ExamInput, ExamCourseSummary } from '../models/Exam.ts';

export class ExamRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private mapExamRow(row: any): Exam {
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            starts_at: new Date(row.starts_at),
            ends_at: new Date(row.ends_at),
            course: {
                id: row.course_id,
                code: row.course_code,
                name: row.course_name
            },
            question_count: parseInt(row.question_count),
            attempt_count: parseInt(row.attempt_count)
        };
    }
}