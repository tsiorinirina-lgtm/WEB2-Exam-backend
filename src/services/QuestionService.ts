import { QuestionRepository } from '../repositories/QuestionRepository.ts';
import { ExamRepository } from '../repositories/ExamRepository.ts';
import type { Question, QuestionInput } from '../models/Question.ts';
import type { ChoiceInput } from '../models/Choice.ts';
import { BadRequestError } from '../errors/BadRequest.ts';
import { NotFoundError } from '../errors/NotFound.ts';
import { ForbiddenError } from '../errors/Forbidden.ts';

export class QuestionService {
    private questionRepository: QuestionRepository;
    private examRepository: ExamRepository;

    constructor(pool: Pool) {
        this.questionRepository = new QuestionRepository(pool);
        this.examRepository = new ExamRepository(pool);
    }

    private validateChoices(choices: ChoiceInput[]): void {
        if (!choices || choices.length < 2 || choices.length > 6) {
            throw new BadRequestError(
                'Question must have between 2 and 6 choices (RG-04)'
            );
        }

        const correctChoices = choices.filter(c => c.isCorrect === true);
        if (correctChoices.length !== 1) {
            throw new BadRequestError(
                'Question must have exactly one correct choice (RG-04)'
            );
        }
    }

    private validateQuestion(questionData: QuestionInput): void {
        if (!questionData.statement || questionData.statement.trim().length === 0) {
            throw new BadRequestError('Question statement is required');
        }
        if (questionData.points !== undefined && questionData.points < 1) {
            throw new BadRequestError('Question points must be at least 1');
        }
        if (questionData.position !== undefined && questionData.position < 1) {
            throw new BadRequestError('Question position must be at least 1');
        }
        this.validateChoices(questionData.choices);
    }

    private async validateExamForEditing(examId: number): Promise<void> {
        const exam = await this.examRepository.findById(examId);
        if (!exam) {
            throw new NotFoundError(`Exam with id ${examId} not found`);
        }
        const now = new Date();
        if (exam.startsAt <= now) {
            throw new ForbiddenError(
                'Cannot modify questions for an exam that has already started'
            );
        }
    }

    private async validateQuestionForEditing(questionId: number): Promise<Question> {
        const question = await this.questionRepository.findById(questionId);
        if (!question) {
            throw new NotFoundError(`Question with id ${questionId} not found`);
        }
        await this.validateExamForEditing(question.examId);
        return question;
    }

    async getAllQuestions(examId: number, isAdmin: boolean = false): Promise<Question[]> {
        const exam = await this.examRepository.findById(examId);
        if (!exam) {
            throw new NotFoundError(`Exam with id ${examId} not found`);
        }

        return await this.questionRepository.findByExamId(examId, isAdmin);
    }

    async getQuestionById(id: number): Promise<Question> {
        const question = await this.questionRepository.findById(id);
        if (!question) {
            throw new NotFoundError(`Question with id ${id} not found`);
        }
        return question;
    }

    async addQuestion(examId: number, questionData: QuestionInput): Promise<Question> {
        await this.validateExamForEditing(examId);
        this.validateQuestion(questionData);
        const currentCount = await this.questionRepository.getQuestionCount(examId);
        const MAX_QUESTIONS = 50;
        if (currentCount >= MAX_QUESTIONS) {
            throw new BadRequestError(
                `Cannot add more than ${MAX_QUESTIONS} questions to an exam`
            );
        }
        if (questionData.position === undefined) {
            questionData.position = currentCount + 1;
        }
        if (questionData.position !== undefined && questionData.position <= currentCount) {
        }

        return await this.questionRepository.create(examId, questionData);
    }

    async updateQuestion(id: number, questionData: Partial<QuestionInput>): Promise<Question> {
        const existingQuestion = await this.validateQuestionForEditing(id);
        if (questionData.choices !== undefined) {
            const completeData: QuestionInput = {
                statement: questionData.statement || existingQuestion.statement,
                points: questionData.points || existingQuestion.points,
                position: questionData.position || existingQuestion.position,
                choices: questionData.choices
            };
            this.validateQuestion(completeData);
        }
        if (questionData.statement !== undefined && questionData.statement.trim().length === 0) {
            throw new BadRequestError('Question statement cannot be empty');
        }
        if (questionData.points !== undefined && questionData.points < 1) {
            throw new BadRequestError('Question points must be at least 1');
        }
        if (questionData.position !== undefined && questionData.position < 1) {
            throw new BadRequestError('Question position must be at least 1');
        }
        if (questionData.position !== undefined && 
            questionData.position !== existingQuestion.position) {
        }
        const updated = await this.questionRepository.update(id, questionData);
        if (!updated) {
            throw new NotFoundError(`Question with id ${id} not found`);
        }
        return updated;
    }

    async deleteQuestion(id: number): Promise<void> {
        await this.validateQuestionForEditing(id);
        await this.questionRepository.delete(id);
    }

    async deleteAllQuestions(examId: number): Promise<void> {
        await this.validateExamForEditing(examId);
        await this.questionRepository.deleteByExamId(examId);
    }

    async getQuestionCount(examId: number): Promise<number> {
        const exam = await this.examRepository.findById(examId);
        if (!exam) {
            throw new NotFoundError(`Exam with id ${examId} not found`);
        }
        return await this.questionRepository.getQuestionCount(examId);
    }

    async getTotalPoints(examId: number): Promise<number> {
        const exam = await this.examRepository.findById(examId);
        if (!exam) {
            throw new NotFoundError(`Exam with id ${examId} not found`);
        }
        return await this.questionRepository.getTotalPoints(examId);
    }

    async reorderQuestions(examId: number, questionIds: number[]): Promise<void> {
        await this.validateExamForEditing(examId);
        const questions = await this.questionRepository.findByExamId(examId, true);
        const existingIds = questions.map(q => q.id);
        for (const id of questionIds) {
            if (!existingIds.includes(id)) {
                throw new BadRequestError(
                    `Question with id ${id} does not belong to exam ${examId}`
                );
            }
        }
        if (questionIds.length !== existingIds.length) {
            throw new BadRequestError(
                'Must include all questions when reordering'
            );
        }
        for (let i = 0; i < questionIds.length; i++) {
            await this.questionRepository.update(questionIds[i], { position: i + 1 });
        }
    }

    async validateQuestionData(questionData: QuestionInput): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            this.validateQuestion(questionData);
            return { valid: true, errors: [] };
        } catch (error) {
            if (error instanceof BadRequestError) {
                return { valid: false, errors: [error.message] };
            }
            throw error;
        }
    }
}
