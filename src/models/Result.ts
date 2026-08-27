export interface ExamResultLine {
  studentId: number;
  name: string;
  score: number;
  submittedAt: Date;
}

export interface ExamResults {
  exam: { id: number; title: string };
  totalPoints: number;
  average: number | null;
  attemptCount: number;
  results: ExamResultLine[];
}

export interface MyResultLine {
  examId: number;
  title: string;
  courseCode: string;
  score: number;
  totalPoints: number;
  submittedAt: Date;
}
