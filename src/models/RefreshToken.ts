export interface RefreshToken {
  id: number;
  user_id: number;
  family_id: string;
  revoked_at: Date | null;
  expires_at: Date;
}
