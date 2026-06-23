import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import bcryptjs from "bcryptjs";
const { compare, hash } = bcryptjs;
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = {
  userId: number;
  email: string;
};

class AuthService {
  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (!secret || secret.length === 0) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    return new TextEncoder().encode(secret);
  }

  /**
   * Hash a password using bcryptjs
   */
  async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  /**
   * Compare a password with its hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }

  /**
   * Create a session token for a user
   */
  async createSessionToken(
    userId: number,
    email: string,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    return this.signSession(
      {
        userId,
        email,
      },
      options
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      userId: payload.userId,
      email: payload.email,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ userId: number; email: string } | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { userId, email } = payload as Record<string, unknown>;

      if (typeof userId !== "number" || typeof email !== "string") {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return {
        userId,
        email,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  /**
   * Authenticate a request using session cookie
   */
  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const user = await db.getUserById(session.userId);

    if (!user) {
      throw ForbiddenError("User not found");
    }

    // Update last signed in
    await db.updateUserLastSignedIn(user.id);

    return user;
  }
}

export const authService = new AuthService();
