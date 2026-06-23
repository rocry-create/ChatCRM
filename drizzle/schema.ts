import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, bigint, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Evolution API Instance configuration
 */
export const evolutionInstances = mysqlTable("evolution_instances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  instanceName: varchar("instanceName", { length: 100 }).notNull(),
  apiUrl: varchar("apiUrl", { length: 500 }).notNull(),
  apiKey: varchar("apiKey", { length: 500 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  status: mysqlEnum("status", ["disconnected", "connecting", "connected"]).default("disconnected").notNull(),
  qrCode: text("qrCode"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EvolutionInstance = typeof evolutionInstances.$inferSelect;
export type InsertEvolutionInstance = typeof evolutionInstances.$inferInsert;

/**
 * Contacts - WhatsApp contacts managed in the CRM
 */
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  instanceId: int("instanceId").notNull(),
  whatsappId: varchar("whatsappId", { length: 50 }).notNull(), // e.g., 5511999999999@s.whatsapp.net
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  name: varchar("name", { length: 200 }),
  profilePicUrl: text("profilePicUrl"),
  notes: text("notes"),
  tags: json("tags").$type<string[]>(),
  funnelStage: mysqlEnum("funnelStage", ["new_lead", "contacted", "negotiation", "closed_won", "closed_lost"]).default("new_lead").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Messages - Chat history with contacts
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  instanceId: int("instanceId").notNull(),
  messageId: varchar("messageId", { length: 100 }), // WhatsApp message ID
  direction: mysqlEnum("direction", ["incoming", "outgoing"]).notNull(),
  messageType: mysqlEnum("messageType", ["text", "image", "audio", "video", "document", "sticker"]).default("text").notNull(),
  content: text("content"), // Text content or media caption
  mediaUrl: text("mediaUrl"), // S3 URL for media files
  mediaMimeType: varchar("mediaMimeType", { length: 100 }),
  status: mysqlEnum("status", ["pending", "sent", "delivered", "read", "failed"]).default("pending").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Quick Reply Templates - Pre-saved messages for fast responses
 */
export const quickReplies = mysqlTable("quick_replies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  messageType: mysqlEnum("messageType", ["text", "image", "audio", "video"]).default("text").notNull(),
  mediaUrl: text("mediaUrl"),
  shortcut: varchar("shortcut", { length: 20 }), // e.g., "/oi" for quick access
  usageCount: int("usageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuickReply = typeof quickReplies.$inferSelect;
export type InsertQuickReply = typeof quickReplies.$inferInsert;

/**
 * Scheduled Messages - Messages to be sent at a specific time
 */
export const scheduledMessages = mysqlTable("scheduled_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId").notNull(),
  instanceId: int("instanceId").notNull(),
  messageType: mysqlEnum("messageType", ["text", "image", "audio", "video"]).default("text").notNull(),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "cancelled"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScheduledMessage = typeof scheduledMessages.$inferSelect;
export type InsertScheduledMessage = typeof scheduledMessages.$inferInsert;

/**
 * Media Library - Uploaded files for quick sending
 */
export const mediaLibrary = mysqlTable("media_library", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaLibraryItem = typeof mediaLibrary.$inferSelect;
export type InsertMediaLibraryItem = typeof mediaLibrary.$inferInsert;

/**
 * Tags - Custom tags for organizing contacts
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(), // Hex color
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
