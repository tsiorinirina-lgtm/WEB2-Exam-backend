import type { Choice, ChoiceInput } from "./Choice.ts";

export interface Question {
  id: number;
  statement: string;
  examId: string;
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
