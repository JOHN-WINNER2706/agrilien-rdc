import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const productsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        province: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const results = await db.select().from(products).where(eq(products.isApproved, true));

      return results.filter((p) => {
        if (input.category && p.category !== input.category) return false;
        if (input.province && p.province !== input.province) return false;
        if (input.minPrice && Number(p.pricePerUnit) < input.minPrice) return false;
        if (input.maxPrice && Number(p.pricePerUnit) > input.maxPrice) return false;
        if (input.search && !p.name.toLowerCase().includes(input.search.toLowerCase())) return false;
        return true;
      });
    }),

  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const result = await db.select().from(products).where(eq(products.id, input)).limit(1);
    if (result.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

    return result[0];
  }),

  myProducts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "agriculteur") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return db.select().from(products).where(eq(products.farmerId, ctx.user.id));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        category: z.string().min(1),
        pricePerUnit: z.number().positive(),
        unit: z.string().min(1),
        quantityAvailable: z.number().positive().int(),
        province: z.string().min(1),
        location: z.string().optional(),
        harvestDate: z.string().optional(),
        expiryDate: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "agriculteur") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(products).values({
        farmerId: ctx.user.id,
        name: input.name,
        description: input.description || null,
        category: input.category,
        pricePerUnit: input.pricePerUnit.toString(),
        unit: input.unit,
        quantityAvailable: input.quantityAvailable,
        province: input.province,
        location: input.location || null,
        harvestDate: input.harvestDate ? new Date(input.harvestDate) : null,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        imageUrl: input.imageUrl || null,
        status: "disponible",
        isApproved: false,
      });

      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        pricePerUnit: z.number().optional(),
        quantityAvailable: z.number().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "agriculteur") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const product = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      if (product.length === 0 || product[0].farmerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.pricePerUnit !== undefined) updateData.pricePerUnit = input.pricePerUnit.toString();
      if (input.quantityAvailable !== undefined) updateData.quantityAvailable = input.quantityAvailable;
      if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;

      await db.update(products).set(updateData).where(eq(products.id, input.id));

      return { success: true };
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "agriculteur") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const product = await db.select().from(products).where(eq(products.id, input)).limit(1);
    if (product.length === 0 || product[0].farmerId !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    await db.update(products).set({ status: "supprimé" }).where(eq(products.id, input));

    return { success: true };
  }),
});
