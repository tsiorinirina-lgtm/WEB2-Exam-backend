export interface Choice {
  id: string;
  text: string;
  isCorrect?: boolean;
  questionId: string;
}

export interface ChoiceInput {
  text: string;
  isCorrect: boolean;
}
