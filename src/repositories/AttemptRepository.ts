import type { Pool, QueryResult } from "pg";
import type { Attempt } from "../models/Attempt.ts";

export class AttemptRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }
}
