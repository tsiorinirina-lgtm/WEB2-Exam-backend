import type { Pool, QueryResult } from "pg";
import type { User } from "../models/User.ts";

export class UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }
}
