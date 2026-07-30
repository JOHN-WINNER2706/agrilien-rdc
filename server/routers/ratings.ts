import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { ratings, orders, products, users } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const ratingsRouter = router({
  // Get ratings for a user
  getByUserId: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return db.select().from(ratings).where(eq(ratings.ratedUserId, input));
    }),

  // Get average rating for a user
  getAverageRating: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRatings = await db
        .select()
        .from(ratings)
        .where(eq(ratings.ratedUserId, input));

      if (userRatings.length === 0) return 0;

      const sum = userRatings.reduce((acc, r) => acc + r.rating, 0);
      return (sum / userRatings.length).toFixed(2);
    }),

  // Check if user can rate an order
  canRate: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const order = await db.select().from(orders).where(eq(orders.id, input)).limit(1);
      if (order.length === 0) return false;

      const ord = order[0];

      // Only buyer can rate, and only if order is delivered
      if (ord.buyerId !== ctx.user.id || ord.status !== "livrée") {
        return false;
      }

      // Check if already rated
      const existing = await db
        .select()
        .from(ratings)
        .where(
          sql`${ratings.orderId} = ${input} AND ${ratings.raterId} = ${ctx.user.id}`
        );

      return existing.length === 0;
    }),

  // Create rating
  create: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        ratedUserId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Verify order exists and belongs to rater
      const order = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (order.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

      const ord = order[0];
      if (ord.buyerId !== ctx.user.id || ord.status !== "livrée") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Check if already rated
      const existing = await db
        .select()
        .from(ratings)
        .where(
          sql`${ratings.orderId} = ${input.orderId} AND ${ratings.raterId} = ${ctx.user.id}`
        );

      if (existing.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Vous avez déjà noté cette commande" });
      }

      await db.insert(ratings).values({
        orderId: input.orderId,
        raterId: ctx.user.id,
        ratedUserId: input.ratedUserId,
        rating: input.rating,
        comment: input.comment || null,
      });

      // Update user's average rating
      const userRatings = await db
        .select()
        .from(ratings)
        .where(eq(ratings.ratedUserId, input.ratedUserId));

      if (userRatings.length > 0) {
        const sum = userRatings.reduce((acc, r) => acc + r.rating, 0);
        const avgRating = (sum / userRatings.length).toString();

        await db
          .update(users)
          .set({ rating: avgRating })
          .where(eq(users.id, input.ratedUserId));
      }

      return { success: true };
    }),
});
