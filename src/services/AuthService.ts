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
import dotenv from "dotenv";

dotenv.config();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

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
    const valid = await bcrypt.compare(
      credentials.password,
      user.password_hash,
    );

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
      if (!stored || stored.expires_at <= new Date()) {
        await client.query("ROLLBACK");
        throw new UnauthorizedError("Invalid refresh token");
      }
      if (stored.revoked_at) {
        await this.refreshTokenRepository.revokeFamily(
          stored.family_id,
          "refresh token reuse",
          client,
        );
        await client.query("COMMIT");
        throw new UnauthorizedError("Refresh token reuse detected");
      }

      const user = await this.userRepository.findById(stored.user_id);
      if (!user || !user.is_active) {
        await client.query("ROLLBACK");
        throw new UnauthorizedError("Account disabled");
      }

      const nextRefreshToken = generateRefreshToken();
      const next = await this.refreshTokenRepository.insert(
        hashRefreshToken(nextRefreshToken),
        user.id,
        stored.family_id,
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
      is_active: user.is_active,
      created_at: user.joined_at,
      role: user.role,
    };
  }

  validate({ email, password }: UserCredential): void {
    if (!EMAIL_PATTERN.test(email)) {
      throw new UnauthorizedError("Invalid email");
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new UnauthorizedError("Invalid password");
    }
  }
}
