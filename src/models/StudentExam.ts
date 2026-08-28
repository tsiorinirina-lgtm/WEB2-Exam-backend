export interface StudentChoice {
  id: number;
  text: string;
}

export interface MyExamQuestion {
  id: number;
  statement: string;
  points: number;
  position: number;
  choices: StudentChoice[];
}

export interface MyExam {
  id: number;
  title: string;
  course: { code: string; name: string };
  description: string | null;
  endsAt: Date;
  questionCount: number;
  totalPoints: number;
}

export interface MyExamDetail extends MyExam {
  questions: MyExamQuestion[];
}

export interface SubmitAnswerInput {
  questionId: number;
  choiceId: number;
}

export interface SubmitAnswerPayload {
  questionId?: unknown;
  choiceId?: unknown;
  question_id?: unknown;
  choice_id?: unknown;
}

export interface SubmitExamDTO {
  answers: SubmitAnswerPayload[];
}

export interface CorrectionLine {
  questionId: number;
  statement: string;
  points: number;
  studentChoiceId: number | null;
  correctChoiceId: number;
  isCorrect: boolean;
}

export interface SubmitExamResult {
  score: number;
  totalPoints: number;
  correction: CorrectionLine[];
}

export interface ExamCorrectionRow {
  question_id: number;
  statement: string;
  points: number;
  correct_choice_id: number;
  choice_id: number | null;
}
