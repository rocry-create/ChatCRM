import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock user for authenticated tests
function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("ChatCRM - Instance Router", () => {
  it("should require authentication for listing instances", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.instance.list()).rejects.toThrow();
  });

  it("should allow authenticated user to list instances", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.instance.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should validate instance creation input", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should fail with empty instance name
    await expect(
      caller.instance.create({
        instanceName: "",
        apiUrl: "https://api.example.com",
        apiKey: "test-key",
      })
    ).rejects.toThrow();
  });
});

describe("ChatCRM - Contact Router", () => {
  it("should require authentication for listing contacts", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.list()).rejects.toThrow();
  });

  it("should allow authenticated user to list contacts", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should validate contact creation requires instanceId and phoneNumber", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should fail without required fields
    await expect(
      caller.contact.create({
        instanceId: 0,
        phoneNumber: "",
      })
    ).rejects.toThrow();
  });

  it("should validate funnel stage values", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Valid funnel stages
    const validStages = ["new_lead", "contacted", "negotiation", "closed_won", "closed_lost"];
    
    for (const stage of validStages) {
      // This tests that the schema accepts valid values
      // The actual creation might fail due to missing instance, but the validation should pass
      try {
        await caller.contact.create({
          instanceId: 999,
          phoneNumber: "5511999999999",
          funnelStage: stage as any,
        });
      } catch (error: any) {
        // We expect it to fail due to missing instance, not validation
        expect(error.message).not.toContain("Invalid enum value");
      }
    }
  });
});

describe("ChatCRM - Quick Reply Router", () => {
  it("should require authentication for listing quick replies", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.quickReply.list()).rejects.toThrow();
  });

  it("should allow authenticated user to list quick replies", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quickReply.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should validate quick reply creation requires title and content", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should fail with empty title
    await expect(
      caller.quickReply.create({
        title: "",
        content: "Test content",
        messageType: "text",
      })
    ).rejects.toThrow();

    // Should fail with empty content
    await expect(
      caller.quickReply.create({
        title: "Test Title",
        content: "",
        messageType: "text",
      })
    ).rejects.toThrow();
  });
});

describe("ChatCRM - Scheduled Message Router", () => {
  it("should require authentication for listing scheduled messages", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.scheduledMessage.list()).rejects.toThrow();
  });

  it("should allow authenticated user to list scheduled messages", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.scheduledMessage.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should validate scheduled message requires contactId, content and scheduledAt", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should fail with missing scheduledAt
    await expect(
      caller.scheduledMessage.create({
        contactId: 1,
        content: "Test message",
        scheduledAt: new Date(0), // Invalid date in the past
        messageType: "text",
      })
    ).rejects.toThrow();
  });
});

describe("ChatCRM - Media Library Router", () => {
  it("should require authentication for listing media", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.mediaLibrary.list()).rejects.toThrow();
  });

  it("should allow authenticated user to list media", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mediaLibrary.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should validate media creation requires fileName, fileKey, fileUrl and mimeType", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should fail with empty fileName
    await expect(
      caller.mediaLibrary.create({
        fileName: "",
        fileKey: "test-key",
        fileUrl: "https://example.com/file.png",
        mimeType: "image/png",
        fileSize: 1024,
      })
    ).rejects.toThrow();
  });
});

describe("ChatCRM - Auth Router", () => {
  it("should return null for unauthenticated user", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("should return user data for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
    expect(result?.name).toBe("Test User");
  });

  it("should clear cookie on logout", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});
