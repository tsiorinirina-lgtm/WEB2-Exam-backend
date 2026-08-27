export interface RefreshToken {
  id: number;
  userId: number;
  familyId: string;
  revokedAt: Date | null;
  expiresAt: Date;
}
