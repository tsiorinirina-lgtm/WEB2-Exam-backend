import type { PoolClient } from "pg";
import { pool } from "../database.ts";

export interface StoredRefreshToken {
  id: string;
  user_id: number;
  family_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
}

export class RefreshTokenRepository {
  async insert(
    tokenHash: string,
    userId: number,
    familyId: string,
    expiresAt: Date,
    client: PoolClient | typeof pool = pool,
  ): Promise<StoredRefreshToken> {
    const result = await client.query<StoredRefreshToken>(
      `INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, family_id, token_hash, expires_at, revoked_at`,
      [userId, familyId, tokenHash, expiresAt],
    );
    return result.rows[0];
  }

  async findForUpdate(
    tokenHash: string,
    client: PoolClient,
  ): Promise<StoredRefreshToken | null> {
    const result = await client.query<StoredRefreshToken>(
      `SELECT id, user_id, family_id, token_hash, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token_hash = $1
       FOR UPDATE`,
      [tokenHash],
    );
    return result.rows[0] ?? null;
  }

  async revoke(
    id: string,
    reason: string,
    replacedBy: string | null,
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      `UPDATE refresh_tokens
       SET revoked_at = now(), revoked_reason = $2, replaced_by = $3
       WHERE id = $1 AND revoked_at IS NULL`,
      [id, reason, replacedBy],
    );
  }

  async revokeFamily(
    familyId: string,
    reason: string,
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      `UPDATE refresh_tokens
       SET revoked_at = now(), revoked_reason = $2
       WHERE family_id = $1 AND revoked_at IS NULL`,
      [familyId, reason],
    );
  }
}
