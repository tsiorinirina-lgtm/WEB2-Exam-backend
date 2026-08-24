import type { Choice } from './Choice.ts';

export interface Question {
    id: string;
    statement: string;
    exam_id: string;
    choices: Choice[];
}

export interface QuestionCreateDTO {
    statement: string;
    exam_id: string;
    choices: Choice[];
}

export interface QuestionUpdateDTO {
    statement?: string;
    choices?: Choice[];
}