import { Pool, QueryResult } from 'pg';
import type { Exam, ExamInput, ExamCourseSummary } from '../models/Exam.ts';

export class ExamRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }
}