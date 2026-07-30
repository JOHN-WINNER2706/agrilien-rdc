import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  // Get user profile
  getProfile: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await db.select().from(users).where(eq(users.id, input)).limit(1);
      if (result.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

      const user = result[0];
      // Don't expose sensitive fields
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        province: user.province,
        profilePicture: user.profilePicture,
        bio: user.bio,
        isVerified: user.isVerified,
        rating: user.rating,
        createdAt: user.createdAt,
      };
    }),

  // Update current user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        province: z.string().optional(),
        bio: z.string().optional(),
        profilePicture: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.province !== undefined) updateData.province = input.province;
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.profilePicture !== undefined) updateData.profilePicture = input.profilePicture;

      await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  // Get users by role (for discovery)
  getByRole: publicProcedure
    .input(
      z.object({
        role: z.enum(["agriculteur", "grossiste", "transporteur"]),
        province: z.string().optional(),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let query = db.select().from(users).where(eq(users.role, input.role));

      const results = await query;

      // Filter by province if provided
      const filtered = input.province
        ? results.filter((u) => u.province === input.province)
        : results;

      // Return limited results
      return filtered.slice(0, input.limit).map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        province: u.province,
        profilePicture: u.profilePicture,
        bio: u.bio,
        isVerified: u.isVerified,
        rating: u.rating,
      }));
    }),

  // Search users
  search: publicProcedure
    .input(z.string().min(1))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const allUsers = await db.select().from(users);

      const results = allUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(input.toLowerCase()) ||
          u.bio?.toLowerCase().includes(input.toLowerCase())
      );

      return results.slice(0, 10).map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        province: u.province,
        profilePicture: u.profilePicture,
        bio: u.bio,
        isVerified: u.isVerified,
        rating: u.rating,
      }));
    }),

  // Get current user (already available via auth.me, but included for completeness)
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      role: ctx.user.role,
      phone: ctx.user.phone,
      province: ctx.user.province,
      profilePicture: ctx.user.profilePicture,
      bio: ctx.user.bio,
      isVerified: ctx.user.isVerified,
      rating: ctx.user.rating,
    };
  }),
});
