export interface Choice {
    id: string;
    statement: string;
    is_correct: boolean;
    question_id: string;
}

export interface ChoiceCreateDTO {
    statement: string;
    is_correct: boolean;
    question_id: string;
}

export interface ChoiceUpdateDTO {
    statement?: string;
    is_correct?: boolean;
}