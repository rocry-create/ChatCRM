import { eq, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  evolutionInstances, InsertEvolutionInstance, EvolutionInstance,
  contacts, InsertContact, Contact,
  messages, InsertMessage, Message,
  quickReplies, InsertQuickReply, QuickReply,
  scheduledMessages, InsertScheduledMessage, ScheduledMessage,
  mediaLibrary, InsertMediaLibraryItem, MediaLibraryItem,
  tags, InsertTag, Tag
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER FUNCTIONS ====================

export async function createUser(user: InsertUser): Promise<number> {
  if (!user.email || !user.passwordHash) {
    throw new Error("User email and passwordHash are required");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(users).values({
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name || null,
      role: user.role || "user",
      lastSignedIn: new Date(),
    });
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

// ==================== EVOLUTION INSTANCE FUNCTIONS ====================

export async function createEvolutionInstance(data: InsertEvolutionInstance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(evolutionInstances).values(data);
  return result[0].insertId;
}

export async function getEvolutionInstancesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(evolutionInstances).where(eq(evolutionInstances.userId, userId));
}

export async function getEvolutionInstanceById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(evolutionInstances)
    .where(and(eq(evolutionInstances.id, id), eq(evolutionInstances.userId, userId)))
    .limit(1);
  return result[0];
}

export async function updateEvolutionInstance(id: number, userId: number, data: Partial<InsertEvolutionInstance>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(evolutionInstances)
    .set(data)
    .where(and(eq(evolutionInstances.id, id), eq(evolutionInstances.userId, userId)));
}

export async function deleteEvolutionInstance(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(evolutionInstances)
    .where(and(eq(evolutionInstances.id, id), eq(evolutionInstances.userId, userId)));
}

// ==================== CONTACT FUNCTIONS ====================

export async function createContact(data: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contacts).values(data);
  return result[0].insertId;
}

export async function getContactsByUser(userId: number, instanceId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (instanceId) {
    return db.select().from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.instanceId, instanceId)))
      .orderBy(desc(contacts.updatedAt));
  }
  return db.select().from(contacts)
    .where(eq(contacts.userId, userId))
    .orderBy(desc(contacts.updatedAt));
}

export async function getContactById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
    .limit(1);
  return result[0];
}

export async function getContactByWhatsappId(whatsappId: string, instanceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(contacts)
    .where(and(eq(contacts.whatsappId, whatsappId), eq(contacts.instanceId, instanceId)))
    .limit(1);
  return result[0];
}

export async function updateContact(id: number, userId: number, data: Partial<InsertContact>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(contacts)
    .set(data)
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
}

export async function deleteContact(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
}

export async function getContactsByFunnelStage(userId: number, instanceId: number, stage: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(contacts)
    .where(and(
      eq(contacts.userId, userId),
      eq(contacts.instanceId, instanceId),
      eq(contacts.funnelStage, stage as any)
    ))
    .orderBy(desc(contacts.updatedAt));
}

// ==================== MESSAGE FUNCTIONS ====================

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(data);
  return result[0].insertId;
}

export async function getMessagesByContact(contactId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(messages)
    .where(eq(messages.contactId, contactId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function updateMessageStatus(messageId: string, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(messages)
    .set({ status: status as any })
    .where(eq(messages.messageId, messageId));
}

// ==================== QUICK REPLY FUNCTIONS ====================

export async function createQuickReply(data: InsertQuickReply) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(quickReplies).values(data);
  return result[0].insertId;
}

export async function getQuickRepliesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(quickReplies)
    .where(eq(quickReplies.userId, userId))
    .orderBy(desc(quickReplies.usageCount));
}

export async function updateQuickReply(id: number, userId: number, data: Partial<InsertQuickReply>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(quickReplies)
    .set(data)
    .where(and(eq(quickReplies.id, id), eq(quickReplies.userId, userId)));
}

export async function deleteQuickReply(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(quickReplies)
    .where(and(eq(quickReplies.id, id), eq(quickReplies.userId, userId)));
}

export async function incrementQuickReplyUsage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const reply = await db.select().from(quickReplies).where(eq(quickReplies.id, id)).limit(1);
  if (reply[0]) {
    await db.update(quickReplies)
      .set({ usageCount: reply[0].usageCount + 1 })
      .where(eq(quickReplies.id, id));
  }
}

// ==================== SCHEDULED MESSAGE FUNCTIONS ====================

export async function createScheduledMessage(data: InsertScheduledMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scheduledMessages).values(data);
  return result[0].insertId;
}

export async function getScheduledMessagesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(scheduledMessages)
    .where(eq(scheduledMessages.userId, userId))
    .orderBy(asc(scheduledMessages.scheduledAt));
}

export async function getPendingScheduledMessages() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(scheduledMessages)
    .where(eq(scheduledMessages.status, "pending"))
    .orderBy(asc(scheduledMessages.scheduledAt));
}

export async function updateScheduledMessage(id: number, data: Partial<InsertScheduledMessage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(scheduledMessages)
    .set(data)
    .where(eq(scheduledMessages.id, id));
}

export async function cancelScheduledMessage(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(scheduledMessages)
    .set({ status: "cancelled" })
    .where(and(eq(scheduledMessages.id, id), eq(scheduledMessages.userId, userId)));
}

// ==================== MEDIA LIBRARY FUNCTIONS ====================

export async function createMediaLibraryItem(data: InsertMediaLibraryItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(mediaLibrary).values(data);
  return result[0].insertId;
}

export async function getMediaLibraryByUser(userId: number, category?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (category) {
    return db.select().from(mediaLibrary)
      .where(and(eq(mediaLibrary.userId, userId), eq(mediaLibrary.category, category)))
      .orderBy(desc(mediaLibrary.createdAt));
  }
  return db.select().from(mediaLibrary)
    .where(eq(mediaLibrary.userId, userId))
    .orderBy(desc(mediaLibrary.createdAt));
}

export async function deleteMediaLibraryItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(mediaLibrary)
    .where(and(eq(mediaLibrary.id, id), eq(mediaLibrary.userId, userId)));
}

// ==================== TAG FUNCTIONS ====================

export async function createTag(data: InsertTag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tags).values(data);
  return result[0].insertId;
}

export async function getTagsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(asc(tags.name));
}

export async function updateTag(id: number, userId: number, data: Partial<InsertTag>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tags)
    .set(data)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)));
}

export async function deleteTag(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)));
}
