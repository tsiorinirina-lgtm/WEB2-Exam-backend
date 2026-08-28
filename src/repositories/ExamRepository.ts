import { Pool } from 'pg';
import type { QueryResult } from 'pg';
import type { Exam, ExamInput } from '../models/Exam.ts';

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
            startsAt: new Date(row.starts_at),
            endsAt: new Date(row.ends_at),
            course: {
                id: row.course_id,
                code: row.course_code,
                name: row.course_name
            },
            questionCount: parseInt(row.question_count),
            attemptCount: parseInt(row.attempt_count)
        };
    }

    async findAll(): Promise<Exam[]> {
        const query = `
            SELECT 
                e.id,
                e.title,
                e.description,
                e.starts_at,
                e.ends_at,
                c.id as course_id,
                c.code as course_code,
                c.name as course_name,
                COALESCE(q.question_count, 0) as question_count,
                COALESCE(a.attempt_count, 0) as attempt_count
            FROM exams e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN (
                SELECT exam_id, COUNT(*) as question_count
                FROM questions
                GROUP BY exam_id
            ) q ON e.id = q.exam_id
            LEFT JOIN (
                SELECT exam_id, COUNT(*) as attempt_count
                FROM attempts
                GROUP BY exam_id
            ) a ON e.id = a.exam_id
            ORDER BY e.starts_at DESC
        `;

        const result: QueryResult = await this.pool.query(query);
        return result.rows.map(row => this.mapExamRow(row));
    }

    async findById(id: number): Promise<Exam | null> {
        const query = `
            SELECT 
                e.id,
                e.title,
                e.description,
                e.starts_at,
                e.ends_at,
                c.id as course_id,
                c.code as course_code,
                c.name as course_name,
                COALESCE(q.question_count, 0) as question_count,
                COALESCE(a.attempt_count, 0) as attempt_count
            FROM exams e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN (
                SELECT exam_id, COUNT(*) as question_count
                FROM questions
                GROUP BY exam_id
            ) q ON e.id = q.exam_id
            LEFT JOIN (
                SELECT exam_id, COUNT(*) as attempt_count
                FROM attempts
                GROUP BY exam_id
            ) a ON e.id = a.exam_id
            WHERE e.id = $1
        `;

        const result: QueryResult = await this.pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return null;
        }

        return this.mapExamRow(result.rows[0]);
    }

    async create(examData: ExamInput): Promise<Exam> {
        const query = `
            INSERT INTO exams (course_id, title, description, starts_at, ends_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;

        const values = [
            examData.courseId,
            examData.title,
            examData.description || null,
            examData.startsAt,
            examData.endsAt
        ];

        const result: QueryResult = await this.pool.query(query, values);
        const id = result.rows[0].id;

        const exam = await this.findById(id);
        return exam as Exam;
    }

    async update(id: number, examData: Partial<ExamInput>): Promise<Exam | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (examData.title !== undefined) {
            updates.push(`title = $${paramIndex}`);
            values.push(examData.title);
            paramIndex++;
        }

        if (examData.description !== undefined) {
            updates.push(`description = $${paramIndex}`);
            values.push(examData.description);
            paramIndex++;
        }

        if (examData.startsAt !== undefined) {
            updates.push(`starts_at = $${paramIndex}`);
            values.push(examData.startsAt);
            paramIndex++;
        }

        if (examData.endsAt !== undefined) {
            updates.push(`ends_at = $${paramIndex}`);
            values.push(examData.endsAt);
            paramIndex++;
        }

        if (examData.courseId !== undefined) {
            updates.push(`course_id = $${paramIndex}`);
            values.push(examData.courseId);
            paramIndex++;
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        values.push(id);
        const query = `
            UPDATE exams
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id
        `;

        const result: QueryResult = await this.pool.query(query, values);
        
        if (result.rows.length === 0) {
            return null;
        }

        return await this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const checkAttemptsQuery = `
            SELECT COUNT(*) as attempt_count
            FROM attempts
            WHERE exam_id = $1
        `;

        const checkResult: QueryResult = await this.pool.query(checkAttemptsQuery, [id]);
        const attemptCount = parseInt(checkResult.rows[0].attempt_count);

        if (attemptCount > 0) {
            throw new Error('Cannot delete exam with existing attempts (RG-09)');
        }

        const deleteQuery = `
            DELETE FROM exams
            WHERE id = $1
            RETURNING id
        `;

        const result: QueryResult = await this.pool.query(deleteQuery, [id]);
        return result.rows.length > 0;
    }

    async getResults(examId: number, exam: Exam): Promise<any> {
        const query = `
            SELECT
                COALESCE(qp.total_points, 0) as total_points,
                a.id as attempt_id,
                u.id as student_id,
                u.firstname || ' ' || u.lastname as student_name,
                a.score,
                a.submitted_at
            FROM exams e
            LEFT JOIN (
                SELECT exam_id, SUM(points) as total_points
                FROM questions
                GROUP BY exam_id
            ) qp ON qp.exam_id = e.id
            LEFT JOIN attempts a ON a.exam_id = e.id
            LEFT JOIN users u ON u.id = a.user_id
            WHERE e.id = $1
            ORDER BY a.score DESC, a.submitted_at ASC
        `;

        const result: QueryResult = await this.pool.query(query, [examId]);
        const attempts = result.rows.filter(row => row.attempt_id !== null);

        let average = null;
        if (attempts.length > 0) {
            const totalScore = attempts.reduce((sum, row) => sum + Number(row.score), 0);
            average = Math.round((totalScore / attempts.length) * 100) / 100;
        }

        return {
            exam: { id: exam.id, title: exam.title },
            totalPoints: parseInt(result.rows[0]?.total_points ?? 0),
            average,
            attemptCount: attempts.length,
            results: attempts.map(row => ({
                studentId: row.student_id,
                name: row.student_name,
                score: Number(row.score),
                submittedAt: row.submitted_at
            }))
        };
    }

    async getAttemptCount(examId: number): Promise<number> {
        const query = `
            SELECT COUNT(*) as count
            FROM attempts
            WHERE exam_id = $1
        `;

        const result: QueryResult = await this.pool.query(query, [examId]);
        return parseInt(result.rows[0].count);
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

    async exists(id: number): Promise<boolean> {
        const query = `
            SELECT EXISTS(
                SELECT 1 FROM exams WHERE id = $1
            ) as exists
        `;

        const result: QueryResult = await this.pool.query(query, [id]);
        return result.rows[0].exists;
    }

    async findByCourseId(courseId: number): Promise<Exam[]> {
        const query = `
            SELECT 
                e.id,
                e.title,
                e.description,
                e.starts_at,
                e.ends_at,
                c.id as course_id,
                c.code as course_code,
                c.name as course_name,
                COALESCE(q.question_count, 0) as question_count,
                COALESCE(a.attempt_count, 0) as attempt_count
            FROM exams e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN (
                SELECT exam_id, COUNT(*) as question_count
                FROM questions
                GROUP BY exam_id
            ) q ON e.id = q.exam_id
            LEFT JOIN (
                SELECT exam_id, COUNT(*) as attempt_count
                FROM attempts
                GROUP BY exam_id
            ) a ON e.id = a.exam_id
            WHERE e.course_id = $1
            ORDER BY e.starts_at DESC
        `;

        const result: QueryResult = await this.pool.query(query, [courseId]);
        return result.rows.map(row => this.mapExamRow(row));
    }
}