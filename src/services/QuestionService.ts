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
}