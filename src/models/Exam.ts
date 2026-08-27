export interface ExamCourseSummary {
  id: number;
  code: string;
  name: string;
}

export interface Exam {
  id: number;
  title: string;
  description: string | null;
  : Date;
  endsAt: Date;
  course: ExamCourseSummary;
  questionCount: number;
  attemptCount: number;
}
export interface ExamInput {
  courseId: number;
  title: string;
  description?: string | null;
  startsAt: Date | string;
  endsAt: Date | string;
}
