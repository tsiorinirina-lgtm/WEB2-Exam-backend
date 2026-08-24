export interface Course {
    id: string;
    code: string;
    name: string;
    description: string | null;
}

export interface CourseCreateDTO {
    code: string;
    name: string;
    description?: string;
}

export interface CourseUpdateDTO {
    code?: string;
    name?: string;
    description?: string;
}