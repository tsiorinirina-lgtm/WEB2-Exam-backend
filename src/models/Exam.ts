export interface ExamCourseSummary {
    id: number;
    code: string;
    name: string;
}

export interface Exam {
    id: number;
    title: string;
    description: string | null;
    starts_at: Date;
    ends_at: Date;
    course: ExamCourseSummary;
    question_count: number;
    attempt_count: number;
}
export interface ExamInput {
    course_id: number;
    title: string;
    description?: string | null;
    starts_at: Date | string;
    ends_at: Date | string;
}