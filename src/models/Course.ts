export interface Course {
    id: string;
    code: string;
    name: string;
    description: string | null;
}

export interface CourseCreateInput {
    code: string;
    name: string;
    description?: string;
}