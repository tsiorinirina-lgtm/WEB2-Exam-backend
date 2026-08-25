export interface Choice {
    id: string;
    text: string;
    is_correct: boolean;
    question_id: string;
}

export interface ChoiceInput {
    text: string;
    is_correct: boolean;
}