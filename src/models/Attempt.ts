export interface Attempt {
    id: string;
    submitted_at: Date;
    score: number;
    exam_id: string;
    user_id: string;
}

export interface AttemptCreateDTO {
    exam_id: string;
    user_id: string;
    score: number;
}