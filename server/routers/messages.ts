import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { messages } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const messagesRouter = router({
  // Get conversation between two users
  getConversation: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return db
        .select()
        .from(messages)
        .where(
          sql`(${messages.senderId} = ${ctx.user.id} AND ${messages.recipientId} = ${input}) OR (${messages.senderId} = ${input} AND ${messages.recipientId} = ${ctx.user.id})`
        );
    }),

  // Get all conversations for current user
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userMessages = await db
      .select()
      .from(messages)
      .where(
        sql`${messages.senderId} = ${ctx.user.id} OR ${messages.recipientId} = ${ctx.user.id}`
      );

    // Group by conversation partner
    const conversations = new Map<
      number,
      {
        userId: number;
        lastMessage: string;
        lastMessageDate: Date;
        unreadCount: number;
      }
    >();

    for (const msg of userMessages) {
      const partnerId = msg.senderId === ctx.user.id ? msg.recipientId : msg.senderId;
      const existing = conversations.get(partnerId);

      if (!existing || msg.createdAt > existing.lastMessageDate) {
        conversations.set(partnerId, {
          userId: partnerId,
          lastMessage: msg.content,
          lastMessageDate: msg.createdAt,
          unreadCount: existing?.unreadCount || 0,
        });
      }

      if (msg.recipientId === ctx.user.id && !msg.isRead) {
        const conv = conversations.get(partnerId)!;
        conv.unreadCount += 1;
      }
    }

    return Array.from(conversations.values());
  }),

  // Send message
  send: protectedProcedure
    .input(
      z.object({
        recipientId: z.number(),
        content: z.string().min(1),
        orderId: z.number().optional(),
        productId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(messages).values({
        senderId: ctx.user.id,
        recipientId: input.recipientId,
        content: input.content,
        orderId: input.orderId || null,
        productId: input.productId || null,
        isRead: false,
      });

      return { success: true };
    }),

  // Mark message as read
  markAsRead: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const msg = await db.select().from(messages).where(eq(messages.id, input)).limit(1);
      if (msg.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

      if (msg[0].recipientId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.update(messages).set({ isRead: true }).where(eq(messages.id, input));

      return { success: true };
    }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const unread = await db
      .select()
      .from(messages)
      .where(
        sql`${messages.recipientId} = ${ctx.user.id} AND ${messages.isRead} = false`
      );

    return unread.length;
  }),
});
