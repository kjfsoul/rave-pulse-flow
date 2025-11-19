import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tracks, InsertTrack, submissions, InsertSubmission, challenges, InsertChallenge, notifications, InsertNotification } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Track management
export async function createTrack(track: InsertTrack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tracks).values(track);
  return result;
}

export async function getUserTracks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tracks).where(eq(tracks.userId, userId)).orderBy(desc(tracks.createdAt));
}

export async function getTrackById(trackId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tracks).where(eq(tracks.id, trackId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTrack(trackId: number, updates: Partial<InsertTrack>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(tracks).set(updates).where(eq(tracks.id, trackId));
}

export async function deleteTrack(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(tracks).where(eq(tracks.id, trackId));
}

// Submission management
export async function createSubmission(submission: InsertSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(submissions).values(submission);
  return result;
}

export async function getUserSubmissions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(submissions).where(eq(submissions.userId, userId)).orderBy(desc(submissions.createdAt));
}

export async function getAllSubmissions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(submissions).orderBy(desc(submissions.votes), desc(submissions.createdAt));
}

export async function voteForSubmission(submissionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const submission = await db.select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
  if (submission.length === 0) throw new Error("Submission not found");
  
  return db.update(submissions).set({ votes: (submission[0].votes || 0) + 1 }).where(eq(submissions.id, submissionId));
}

// Challenge management
export async function createChallenge(challenge: InsertChallenge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(challenges).values(challenge);
  return result;
}

export async function getUserChallenges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(challenges).where(eq(challenges.userId, userId)).orderBy(desc(challenges.createdAt));
}

export async function completeChallenge(challengeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(challenges).set({ 
    completed: true, 
    completedAt: new Date() 
  }).where(eq(challenges.id, challengeId));
}

export async function updateUserScene(userId: number, scene: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(users).set({ activeScene: scene }).where(eq(users.id, userId));
}

export async function decrementAICredits(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) throw new Error("User not found");
  
  const currentCredits = user[0].aiGenerationCredits || 0;
  if (currentCredits <= 0) throw new Error("No AI generation credits remaining");
  
  return db.update(users).set({ aiGenerationCredits: currentCredits - 1 }).where(eq(users.id, userId));
}

// Notification management
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function getUserNotifications(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  if (unreadOnly) {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId) && eq(notifications.isRead, false))
      .orderBy(desc(notifications.createdAt));
  }
  
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function deleteNotification(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(notifications).where(eq(notifications.id, notificationId));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(notifications)
    .where(eq(notifications.userId, userId) && eq(notifications.isRead, false));
  
  return result.length;
}
