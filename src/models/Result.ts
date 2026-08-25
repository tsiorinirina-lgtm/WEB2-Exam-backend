export interface ExamResultLine {
    student_id: number;
    name: string;
    score: number;
    submitted_at: Date;
}

export interface ExamResults {
    exam: { id: number; title: string };
    total_points: number;
    average: number | null;
    attempt_count: number;
    results: ExamResultLine[];
}