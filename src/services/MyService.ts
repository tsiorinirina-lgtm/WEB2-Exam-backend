import { Pool } from "pg";
import { AttemptRepository } from "../repositories/AttemptRepository.ts";
import { QuestionRepository } from "../repositories/QuestionRepository.ts";

export class MyService {
  private pool: Pool;
  private attemptRepository: AttemptRepository;
  private questionRepository: QuestionRepository;

  constructor(pool = new Pool()) {
    this.pool = pool;
    this.attemptRepository = new AttemptRepository(pool);
    this.questionRepository = new QuestionRepository(pool);
  }
}
