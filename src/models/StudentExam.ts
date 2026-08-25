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
    ends_at: Date;
    question_count: number;
    total_points: number;
}

export interface MyExamDetail extends MyExam {
    questions: MyExamQuestion[];
}