import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  /** User's selected festival scene/archetype */
  activeScene: varchar("activeScene", { length: 64 }).default("deep_forest"),
  /** AI generation credits remaining (for pro tier limits) */
  aiGenerationCredits: int("aiGenerationCredits").default(10).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User-uploaded or generated audio tracks
 */
export const tracks = mysqlTable("tracks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Track name/title */
  name: varchar("name", { length: 255 }).notNull(),
  /** S3 file key for the audio file */
  fileKey: text("fileKey").notNull(),
  /** Public URL to the audio file */
  url: text("url").notNull(),
  /** MIME type (audio/mp3, audio/wav, etc.) */
  mimeType: varchar("mimeType", { length: 64 }),
  /** File size in bytes */
  fileSize: int("fileSize"),
  /** Track duration in seconds */
  duration: int("duration"),
  /** BPM detected by BeatDetect.js (free tier) */
  bpmDetected: int("bpmDetected"),
  /** BPM from Tonn API (pro tier) */
  bpmAccurate: int("bpmAccurate"),
  /** Musical key from Tonn API */
  musicalKey: varchar("musicalKey", { length: 16 }),
  /** Track source: upload, freesound, loudly */
  source: mysqlEnum("source", ["upload", "freesound", "loudly"]).notNull(),
  /** Whether user confirmed broadcast rights */
  broadcastRightsConfirmed: boolean("broadcastRightsConfirmed").default(false).notNull(),
  /** Attribution credits for CC-BY samples (JSON array) */
  attributionCredits: text("attributionCredits"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

/**
 * Festival competition submissions
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Submission title/track name */
  title: varchar("title", { length: 255 }).notNull(),
  /** Artist name (user's display name) */
  artistName: varchar("artistName", { length: 255 }).notNull(),
  /** S3 file key for the rendered submission */
  fileKey: text("fileKey").notNull(),
  /** Public URL to the submission file */
  url: text("url").notNull(),
  /** Attribution credits (JSON array) */
  attributionCredits: text("attributionCredits"),
  /** Festival scene/theme */
  festivalScene: varchar("festivalScene", { length: 64 }),
  /** Vote count */
  votes: int("votes").default(0).notNull(),
  /** Submission status */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

/**
 * User challenges and achievements (for GameOverlay)
 */
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Challenge description */
  description: text("description").notNull(),
  /** Challenge type: bpm, loop, mix, etc. */
  challengeType: varchar("challengeType", { length: 64 }).notNull(),
  /** Target value (e.g., 140 for BPM challenge) */
  targetValue: varchar("targetValue", { length: 64 }),
  /** Whether challenge is completed */
  completed: boolean("completed").default(false).notNull(),
  /** Points awarded */
  points: int("points").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

/**
 * User notifications for in-app alerts
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Notification title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Notification message/body */
  message: text("message").notNull(),
  /** Notification type: info, success, warning, error */
  type: mysqlEnum("type", ["info", "success", "warning", "error"]).default("info").notNull(),
  /** Whether notification has been read */
  isRead: boolean("isRead").default(false).notNull(),
  /** Optional action URL */
  actionUrl: varchar("actionUrl", { length: 512 }),
  /** Optional action label */
  actionLabel: varchar("actionLabel", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
