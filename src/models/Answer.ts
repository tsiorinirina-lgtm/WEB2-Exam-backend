export interface Answer {
  id: string;
  attemptId: string;
  examId: string;
  questionId: string;
  choiceId: string | null;
}

export interface AnswerCreateDTO {
  attemptId: string;
  examId: string;
  questionId: string;
  choiceId: string | null;
}
