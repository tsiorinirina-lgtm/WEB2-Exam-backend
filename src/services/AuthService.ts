import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository.ts";
import { RefreshTokenRepository } from "../repositories/RefreshTokenRepository.ts";
import type {
  AuthenticatedUser,
  LoginResponseDTO,
  UserCredential,
} from "../models/User.ts";
import {
  generateRefreshToken,
  generateTokenFamilyId,
  hashRefreshToken,
  signToken,
} from "../security/JWT.ts";
import { UnauthorizedError } from "../errors/Unauthorized.ts";
import { pool } from "../config/database.ts";
export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  async login(credentials: UserCredential): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findByMail(credentials.email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }
    const valid = await bcrypt.compare(credentials.password, user.password);

    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }
    const authenticatedUser = this.toAuthenticatedUser(user);
    const accessToken = signToken(authenticatedUser);
    const refreshToken = await this.issueRefreshToken(user.id);
    return { accessToken, refreshToken, user: authenticatedUser };
  }

  async refresh(refreshToken: string): Promise<LoginResponseDTO> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const stored = await this.refreshTokenRepository.findForUpdate(
        hashRefreshToken(refreshToken),
        client,
      );
      if (!stored || stored.expiresAt <= new Date()) {
        await client.query("ROLLBACK");
        throw new UnauthorizedError("Invalid refresh token");
      }
      if (stored.revokedAt) {
        await this.refreshTokenRepository.revokeFamily(
          stored.familyId,
          "refresh token reuse",
          client,
        );
        await client.query("COMMIT");
        throw new UnauthorizedError("Refresh token reuse detected");
      }

      const user = await this.userRepository.findById(stored.userId);
      if (!user || !user.isActive) {
        await client.query("ROLLBACK");
        throw new UnauthorizedError("Account disabled");
      }

      const nextRefreshToken = generateRefreshToken();
      const next = await this.refreshTokenRepository.insert(
        hashRefreshToken(nextRefreshToken),
        user.id,
        stored.familyId,
        this.refreshExpiry(),
        client,
      );
      await this.refreshTokenRepository.revoke(
        stored.id,
        "rotated",
        next.id,
        client,
      );
      await client.query("COMMIT");
      const authenticatedUser = this.toAuthenticatedUser(user);
      return {
        accessToken: signToken(authenticatedUser),
        refreshToken: nextRefreshToken,
        user: authenticatedUser,
      };
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  private async issueRefreshToken(userId: number): Promise<string> {
    const token = generateRefreshToken();
    await this.refreshTokenRepository.insert(
      hashRefreshToken(token),
      userId,
      generateTokenFamilyId(),
      this.refreshExpiry(),
    );
    return token;
  }

  private refreshExpiry(): Date {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  private toAuthenticatedUser(
    user: Awaited<ReturnType<UserRepository["findByMail"]>> & object,
  ): AuthenticatedUser {
    return {
      id: user.id,
      mail: user.mail,
      name: `${user.firstname} ${user.lastname}`,
      isActive: user.isActive,
      createdAt: user.joinedAt,
      role: user.role,
    };
  }

}
