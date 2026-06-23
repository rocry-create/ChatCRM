import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import axios from "axios";
import { authService } from "./_core/auth";
import { ENV } from "./_core/env";

// ==================== EVOLUTION API HELPER ====================

async function evolutionApiRequest(
  apiUrl: string,
  apiKey: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  data?: any
) {
  const url = `${apiUrl}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    apikey: apiKey,
  };

  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("[Evolution API Error]", error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new Error("Invalid email or password");
        }

        const passwordMatch = await authService.comparePassword(
          input.password,
          user.passwordHash
        );
        if (!passwordMatch) {
          throw new Error("Invalid email or password");
        }

        const sessionToken = await authService.createSessionToken(
          user.id,
          user.email
        );

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),

    signup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new Error("Email already registered");
        }

        // Hash password
        const passwordHash = await authService.hashPassword(input.password);

        // Create user
        const userId = await db.createUser({
          email: input.email,
          passwordHash,
          name: input.name || null,
          role: "user",
        });

        const user = await db.getUserById(userId);
        if (!user) {
          throw new Error("Failed to create user");
        }

        const sessionToken = await authService.createSessionToken(
          user.id,
          user.email
        );

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== EVOLUTION INSTANCE ROUTES ====================
  
  instance: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getEvolutionInstancesByUser(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getEvolutionInstanceById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        instanceName: z.string().min(1).max(100),
        apiUrl: z.string().url(),
        apiKey: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createEvolutionInstance({
          userId: ctx.user.id,
          instanceName: input.instanceName,
          apiUrl: input.apiUrl.replace(/\/$/, ""), // Remove trailing slash
          apiKey: input.apiKey,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        instanceName: z.string().min(1).max(100).optional(),
        apiUrl: z.string().url().optional(),
        apiKey: z.string().min(1).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        if (data.apiUrl) {
          data.apiUrl = data.apiUrl.replace(/\/$/, "");
        }
        await db.updateEvolutionInstance(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteEvolutionInstance(input.id, ctx.user.id);
        return { success: true };
      }),

    // Get QR Code from Evolution API
    getQrCode: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const instance = await db.getEvolutionInstanceById(input.id, ctx.user.id);
        if (!instance) {
          throw new Error("Instance not found");
        }

        // Call Evolution API to get QR Code
        const result = await evolutionApiRequest(
          instance.apiUrl,
          instance.apiKey,
          "GET",
          `/instance/connect/${instance.instanceName}`
        );

        if (result.success && result.data?.qrcode?.base64) {
          await db.updateEvolutionInstance(input.id, ctx.user.id, {
            qrCode: result.data.qrcode.base64,
            status: "connecting",
          });
          return { qrCode: result.data.qrcode.base64 };
        }

        // Check if already connected
        if (result.data?.instance?.state === "open") {
          await db.updateEvolutionInstance(input.id, ctx.user.id, {
            status: "connected",
            phoneNumber: result.data.instance?.owner?.split("@")[0],
          });
          return { connected: true };
        }

        throw new Error(result.error || "Failed to get QR Code");
      }),

    // Check connection status
    checkStatus: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const instance = await db.getEvolutionInstanceById(input.id, ctx.user.id);
        if (!instance) {
          throw new Error("Instance not found");
        }

        const result = await evolutionApiRequest(
          instance.apiUrl,
          instance.apiKey,
          "GET",
          `/instance/connectionState/${instance.instanceName}`
        );

        if (result.success) {
          const state = result.data?.instance?.state;
          let status: "disconnected" | "connecting" | "connected" = "disconnected";
          
          if (state === "open") status = "connected";
          else if (state === "connecting") status = "connecting";

          await db.updateEvolutionInstance(input.id, ctx.user.id, { status });
          return { status, state };
        }

        return { status: instance.status, error: result.error };
      }),

    // Disconnect instance
    disconnect: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const instance = await db.getEvolutionInstanceById(input.id, ctx.user.id);
        if (!instance) {
          throw new Error("Instance not found");
        }

        await evolutionApiRequest(
          instance.apiUrl,
          instance.apiKey,
          "DELETE",
          `/instance/logout/${instance.instanceName}`
        );

        await db.updateEvolutionInstance(input.id, ctx.user.id, {
          status: "disconnected",
          qrCode: null,
        });

        return { success: true };
      }),
  }),

  // ==================== CONTACT ROUTES ====================
  
  contact: router({
    list: protectedProcedure
      .input(z.object({ instanceId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getContactsByUser(ctx.user.id, input?.instanceId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getContactById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        instanceId: z.number(),
        phoneNumber: z.string().min(10).max(20),
        name: z.string().max(200).optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
        funnelStage: z.enum(["new_lead", "contacted", "negotiation", "closed_won", "closed_lost"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Format WhatsApp ID
        const cleanPhone = input.phoneNumber.replace(/\D/g, "");
        const whatsappId = `${cleanPhone}@s.whatsapp.net`;

        // Check if contact already exists
        const existing = await db.getContactByWhatsappId(whatsappId, input.instanceId);
        if (existing) {
          throw new Error("Contact already exists");
        }

        const id = await db.createContact({
          userId: ctx.user.id,
          instanceId: input.instanceId,
          whatsappId,
          phoneNumber: cleanPhone,
          name: input.name,
          notes: input.notes,
          tags: input.tags,
          funnelStage: input.funnelStage || "new_lead",
        });

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().max(200).optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
        funnelStage: z.enum(["new_lead", "contacted", "negotiation", "closed_won", "closed_lost"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateContact(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteContact(input.id, ctx.user.id);
        return { success: true };
      }),

    // Get contacts grouped by funnel stage (for Kanban)
    byFunnelStage: protectedProcedure
      .input(z.object({ instanceId: z.number() }))
      .query(async ({ ctx, input }) => {
        const stages = ["new_lead", "contacted", "negotiation", "closed_won", "closed_lost"] as const;
        const result: Record<string, any[]> = {};

        for (const stage of stages) {
          result[stage] = await db.getContactsByFunnelStage(ctx.user.id, input.instanceId, stage);
        }

        return result;
      }),
  }),

  // ==================== MESSAGE ROUTES ====================
  
  message: router({
    list: protectedProcedure
      .input(z.object({ contactId: z.number(), limit: z.number().max(100).optional() }))
      .query(async ({ ctx, input }) => {
        // Verify contact belongs to user
        const contact = await db.getContactById(input.contactId, ctx.user.id);
        if (!contact) {
          throw new Error("Contact not found");
        }
        return db.getMessagesByContact(input.contactId, input.limit || 50);
      }),

    send: protectedProcedure
      .input(z.object({
        contactId: z.number(),
        messageType: z.enum(["text", "image", "audio", "video", "document"]),
        content: z.string().optional(),
        mediaUrl: z.string().optional(),
        mediaMimeType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get contact and instance
        const contact = await db.getContactById(input.contactId, ctx.user.id);
        if (!contact) {
          throw new Error("Contact not found");
        }

        const instance = await db.getEvolutionInstanceById(contact.instanceId, ctx.user.id);
        if (!instance) {
          throw new Error("Instance not found");
        }

        // Prepare message payload for Evolution API
        let endpoint = "";
        let payload: any = {
          number: contact.phoneNumber,
        };

        switch (input.messageType) {
          case "text":
            endpoint = `/message/sendText/${instance.instanceName}`;
            payload.text = input.content;
            break;
          case "image":
            endpoint = `/message/sendMedia/${instance.instanceName}`;
            payload.mediatype = "image";
            payload.media = input.mediaUrl;
            payload.caption = input.content;
            break;
          case "audio":
            endpoint = `/message/sendWhatsAppAudio/${instance.instanceName}`;
            payload.audio = input.mediaUrl;
            break;
          case "video":
            endpoint = `/message/sendMedia/${instance.instanceName}`;
            payload.mediatype = "video";
            payload.media = input.mediaUrl;
            payload.caption = input.content;
            break;
          case "document":
            endpoint = `/message/sendMedia/${instance.instanceName}`;
            payload.mediatype = "document";
            payload.media = input.mediaUrl;
            payload.fileName = "document";
            break;
        }

        // Send via Evolution API
        const result = await evolutionApiRequest(
          instance.apiUrl,
          instance.apiKey,
          "POST",
          endpoint,
          payload
        );

        // Save message to database
        const messageId = await db.createMessage({
          contactId: input.contactId,
          instanceId: contact.instanceId,
          messageId: result.data?.key?.id,
          direction: "outgoing",
          messageType: input.messageType,
          content: input.content,
          mediaUrl: input.mediaUrl,
          mediaMimeType: input.mediaMimeType,
          status: result.success ? "sent" : "failed",
          sentAt: result.success ? new Date() : undefined,
        });

        // Update contact's updatedAt
        await db.updateContact(input.contactId, ctx.user.id, {});

        return { 
          id: messageId, 
          success: result.success,
          error: result.error 
        };
      }),
  }),

  // ==================== QUICK REPLY ROUTES ====================
  
  quickReply: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getQuickRepliesByUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(100),
        content: z.string().min(1),
        messageType: z.enum(["text", "image", "audio", "video"]).optional(),
        mediaUrl: z.string().optional(),
        shortcut: z.string().max(20).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createQuickReply({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          messageType: input.messageType || "text",
          mediaUrl: input.mediaUrl,
          shortcut: input.shortcut,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(100).optional(),
        content: z.string().min(1).optional(),
        messageType: z.enum(["text", "image", "audio", "video"]).optional(),
        mediaUrl: z.string().optional(),
        shortcut: z.string().max(20).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateQuickReply(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteQuickReply(input.id, ctx.user.id);
        return { success: true };
      }),

    use: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementQuickReplyUsage(input.id);
        return { success: true };
      }),
  }),

  // ==================== SCHEDULED MESSAGE ROUTES ====================
  
  scheduledMessage: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getScheduledMessagesByUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        contactId: z.number(),
        messageType: z.enum(["text", "image", "audio", "video"]).optional(),
        content: z.string().optional(),
        mediaUrl: z.string().optional(),
        scheduledAt: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify contact belongs to user
        const contact = await db.getContactById(input.contactId, ctx.user.id);
        if (!contact) {
          throw new Error("Contact not found");
        }

        const id = await db.createScheduledMessage({
          userId: ctx.user.id,
          contactId: input.contactId,
          instanceId: contact.instanceId,
          messageType: input.messageType || "text",
          content: input.content,
          mediaUrl: input.mediaUrl,
          scheduledAt: input.scheduledAt,
        });

        return { id };
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.cancelScheduledMessage(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ==================== MEDIA LIBRARY ROUTES ====================
  
  mediaLibrary: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getMediaLibraryByUser(ctx.user.id, input?.category);
      }),

    create: protectedProcedure
      .input(z.object({
        fileName: z.string().min(1).max(255),
        fileKey: z.string().min(1),
        fileUrl: z.string().url(),
        mimeType: z.string().min(1),
        fileSize: z.number(),
        category: z.string().max(50).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createMediaLibraryItem({
          userId: ctx.user.id,
          ...input,
        });
        return { id };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteMediaLibraryItem(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ==================== TAG ROUTES ====================
  
  tag: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTagsByUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(50),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createTag({
          userId: ctx.user.id,
          name: input.name,
          color: input.color || "#3B82F6",
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(50).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateTag(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTag(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
