export interface Choice {
    id: string;
    label: string;
    is_correct: boolean;
    question_id: string;
}

export interface ChoiceCreateInput {
    label: string;
    is_correct: boolean;
    question_id: string;
}