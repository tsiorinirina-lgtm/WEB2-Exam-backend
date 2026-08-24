export interface Exam {
    id: string;
    title: string;
    description: string | null;
    date_hour_start: Date;
    date_hour_end: Date;
    course_id: string;
}

export interface ExamCreateDTO {
    title: string;
    description?: string;
    date_hour_start: Date | string;
    date_hour_end: Date | string;
    course_id: string;
}

export interface ExamUpdateDTO {
    title?: string;
    description?: string;
    date_hour_start?: Date | string;
    date_hour_end?: Date | string;
    course_id?: string;
}