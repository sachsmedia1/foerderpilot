/**
 * FOERDERPILOT - EMAIL AUTH TESTS
 * 
 * Tests für E-Mail/Passwort-Authentifizierung
 */

import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Email/Password Authentication", () => {
  let testEmail: string;
  let testUserId: number;

  beforeAll(async () => {
    // Cleanup: Lösche Test-User falls vorhanden
    testEmail = `test-${Date.now()}@example.com`;
    const db = await getDb();
    if (db) {
      await db.delete(users).where(eq(users.email, testEmail));
    }
  });

  it("should register a new user", async () => {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "TestPassword123!",
        firstName: "Test",
        lastName: "User",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(testEmail);
    testUserId = data.user.id;
  });

  it("should reject duplicate email registration", async () => {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "AnotherPassword123!",
        firstName: "Duplicate",
        lastName: "User",
      }),
    });

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toContain("bereits registriert");
  });

  it("should login with correct credentials", async () => {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "TestPassword123!",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(testEmail);
  });

  it("should reject login with wrong password", async () => {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "WrongPassword123!",
      }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Ungültige");
  });

  it("should reject login with non-existent email", async () => {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "TestPassword123!",
      }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Ungültige");
  });

  it("should request password reset", async () => {
    const response = await fetch("http://localhost:3000/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("E-Mail");
  });

  it("should reset password with valid token", async () => {
    // Get reset token from database
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    expect(user).toBeDefined();
    expect(user.resetToken).toBeDefined();

    const response = await fetch("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: user.resetToken,
        newPassword: "NewPassword123!",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("zurückgesetzt");
  });

  it("should login with new password after reset", async () => {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "NewPassword123!",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("should reject password reset with invalid token", async () => {
    const response = await fetch("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "invalid-token-12345",
        newPassword: "AnotherPassword123!",
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Ungültiger");
  });
});
