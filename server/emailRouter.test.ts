import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import type { Request, Response } from "express";

describe("Email Router", () => {
  let ctx: Awaited<ReturnType<typeof createContext>>;

  beforeAll(async () => {
    // Create mock request and response
    const req = {
      headers: {},
      cookies: {},
    } as unknown as Request;

    const res = {
      cookie: () => {},
      clearCookie: () => {},
    } as unknown as Response;

    ctx = await createContext({ req, res });
  });

  it("should have RESEND_API_KEY configured", () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).toMatch(/^re_/);
  });

  it("should send password reset email", async () => {
    const caller = appRouter.createCaller(ctx);

    const result = await caller.email.sendPasswordReset({
      email: "test@example.com",
      token: "test-token-123",
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("should validate email format for password reset", async () => {
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.email.sendPasswordReset({
        email: "invalid-email",
        token: "test-token-123",
      })
    ).rejects.toThrow();
  });
});
