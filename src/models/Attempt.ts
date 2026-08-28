export interface Attempt {
  id: string;
  submittedAt: Date;
  score: number;
  examId: string;
  userId: string;
}

export interface AttemptCreateDTO {
  examId: string;
  userId: string;
  score: number;
}

export interface AttemptRow {
  id: number;
  submitted_at: Date;
  score: number;
  exam_id: number;
  user_id: number;
}
