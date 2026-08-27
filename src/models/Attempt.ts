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
