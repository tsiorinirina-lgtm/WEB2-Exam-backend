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

    constructor(
        questionRepository: QuestionRepository,
        examRepository: ExamRepository
    ) {
        this.questionRepository = questionRepository;
        this.examRepository = examRepository;
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
        if (exam.starts_at <= now) {
            throw new ForbiddenError(
                'Cannot modify questions for an exam that has already started'
            );
        }
    }
}