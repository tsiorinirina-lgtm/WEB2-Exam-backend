import type { Choice, ChoiceInput } from './Choice.ts';

export interface Question {
    id: number;
    statement: string;
    exam_id: string;
    points: number;
    position: number;
    choices: Choice[];
}

export interface QuestionInput {
    statement: string;
    points?: number;
    position?: number;
    choices: ChoiceInput[];
}