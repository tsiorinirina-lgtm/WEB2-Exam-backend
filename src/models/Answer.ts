export interface Answer {
    id: string;
    attempt_id: string;
    exam_id: string;
    question_id: string;
    choice_id: string | null;
}

export interface AnswerCreateInput {
    attempt_id: string;
    exam_id: string;
    question_id: string;
    choice_id: string | null;
}