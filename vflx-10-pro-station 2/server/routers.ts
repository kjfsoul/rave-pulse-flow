import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { freesoundRouter } from "./routers/freesound";

export const appRouter = router({
  system: systemRouter,
  freesound: freesoundRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Track management
  tracks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserTracks(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        fileKey: z.string(),
        fileData: z.string().optional(), // Base64 encoded file data (optional for Freesound)
        fileUrl: z.string().optional(), // Direct URL for Freesound streaming
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
        duration: z.number().optional(),
        bpmDetected: z.number().optional(),
        source: z.enum(['upload', 'freesound', 'loudly']),
        broadcastRightsConfirmed: z.boolean().default(false),
        attributionCredits: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let finalUrl: string;
        
        if (input.source === 'freesound' && input.fileUrl) {
          // For Freesound: Use the provided URL directly (no re-hosting)
          finalUrl = input.fileUrl;
        } else if (input.fileData) {
          // For uploads: Upload file to S3
          const fileBuffer = Buffer.from(input.fileData, 'base64');
          const { url: s3Url } = await storagePut(
            input.fileKey,
            fileBuffer,
            input.mimeType || 'audio/mpeg'
          );
          finalUrl = s3Url;
        } else {
          throw new Error('Either fileData or fileUrl must be provided');
        }
        
        // Create track record
        return db.createTrack({
          userId: ctx.user.id,
          name: input.name,
          fileKey: input.fileKey,
          url: finalUrl,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          duration: input.duration,
          bpmDetected: input.bpmDetected,
          source: input.source,
          broadcastRightsConfirmed: input.broadcastRightsConfirmed,
          attributionCredits: input.attributionCredits,
        });
      }),
    
    updateAnalysis: protectedProcedure
      .input(z.object({
        trackId: z.number(),
        bpmAccurate: z.number().optional(),
        musicalKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const track = await db.getTrackById(input.trackId);
        if (!track || track.userId !== ctx.user.id) {
          throw new Error('Track not found or unauthorized');
        }
        
        return db.updateTrack(input.trackId, {
          bpmAccurate: input.bpmAccurate,
          musicalKey: input.musicalKey,
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({
        trackId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const track = await db.getTrackById(input.trackId);
        if (!track || track.userId !== ctx.user.id) {
          throw new Error('Track not found or unauthorized');
        }
        
        return db.deleteTrack(input.trackId);
      }),
  }),

  // Submission management
  submissions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSubmissions(ctx.user.id);
    }),
    
    listAll: publicProcedure.query(async () => {
      return db.getAllSubmissions();
    }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        artistName: z.string(),
        fileKey: z.string(),
        url: z.string(),
        attributionCredits: z.string().optional(),
        festivalScene: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createSubmission({
          userId: ctx.user.id,
          ...input,
        });
        
        // Create notification for successful submission
        await db.createNotification({
          userId: ctx.user.id,
          title: 'Submission Successful! 🎉',
          message: `Your track "${input.title}" has been submitted to the ${input.festivalScene || 'festival'} competition. Good luck!`,
          type: 'success',
        });
        
        return result;
      }),
    
    vote: protectedProcedure
      .input(z.object({
        submissionId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.voteForSubmission(input.submissionId);
        
        // Get submission details to notify the creator
        const submission = await db.getAllSubmissions();
        const votedSubmission = submission.find(s => s.id === input.submissionId);
        
        if (votedSubmission && votedSubmission.userId !== ctx.user.id) {
          // Notify submission creator about new vote
          await db.createNotification({
            userId: votedSubmission.userId,
            title: 'New Vote! 👍',
            message: `Someone voted for your track "${votedSubmission.title}"! You now have ${(votedSubmission.votes || 0) + 1} votes.`,
            type: 'success',
          });
        }
        
        return result;
      }),
  }),

  // Challenge management
  challenges: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserChallenges(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        description: z.string(),
        challengeType: z.string(),
        targetValue: z.string().optional(),
        points: z.number().default(10),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createChallenge({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    complete: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const challenge = await db.getUserChallenges(ctx.user.id);
        const targetChallenge = challenge.find(c => c.id === input.challengeId);
        
        if (!targetChallenge) {
          throw new Error('Challenge not found or unauthorized');
        }
        
        return db.completeChallenge(input.challengeId);
      }),
  }),

  // Notification management
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        unreadOnly: z.boolean().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserNotifications(ctx.user.id, input?.unreadOnly);
      }),
    
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string(),
        type: z.enum(['info', 'success', 'warning', 'error']).optional(),
        actionUrl: z.string().optional(),
        actionLabel: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createNotification({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({
        notificationId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.markNotificationAsRead(input.notificationId);
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      return db.markAllNotificationsAsRead(ctx.user.id);
    }),
    
    delete: protectedProcedure
      .input(z.object({
        notificationId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.deleteNotification(input.notificationId);
      }),
  }),

  // User preferences
  user: router({
    updateScene: protectedProcedure
      .input(z.object({
        scene: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateUserScene(ctx.user.id, input.scene);
      }),
    
    getAICredits: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user.aiGenerationCredits || 0;
    }),
    
    useAICredit: protectedProcedure.mutation(async ({ ctx }) => {
      return db.decrementAICredits(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
