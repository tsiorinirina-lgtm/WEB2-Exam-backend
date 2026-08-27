import type {Pool, ResultQuery} from "pg";
import type {Course, CourseInput} from "../models/Course.ts";

export class CourseRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    getAll = async (): Promise<Course[]> {
        const client = await this.pool.connect();
        try{
            const result: ResultQuery = await client.query("SELECT * FROM courses");
            return result.rows;
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }
}