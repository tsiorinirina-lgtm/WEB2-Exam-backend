import type { ChoiceCreateInput } from './Choice.ts';

export interface Question {
    id: string;
    statement: string;
    exam_id: string;
}

export interface QuestionCreateInput {
    statement: string;
    exam_id: string;
    choices: ChoiceCreateInput[];
}

export interface QuestionUpdateInput {
    statement?: string;
}