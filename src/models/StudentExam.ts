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