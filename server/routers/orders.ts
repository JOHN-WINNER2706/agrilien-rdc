import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { orders, products } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const ordersRouter = router({
  // Get buyer's orders
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "grossiste") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return db.select().from(orders).where(eq(orders.buyerId, ctx.user.id));
  }),

  // Get farmer's received orders
  receivedOrders: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "agriculteur") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const farmerProducts = await db.select().from(products).where(eq(products.farmerId, ctx.user.id));
    const productIds = farmerProducts.map((p) => p.id);

    if (productIds.length === 0) return [];

    return db.select().from(orders).where(
      sql`${orders.productId} IN (${productIds.join(",")})`
    );
  }),

  // Get transporter's delivery orders
  deliveryOrders: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "transporteur") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return db.select().from(orders).where(eq(orders.transporterId, ctx.user.id));
  }),

  // Create order
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().positive().int(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "grossiste") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const product = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);
      if (product.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

      const prod = product[0];
      if (input.quantity > prod.quantityAvailable) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Quantité insuffisante" });
      }

      const totalPrice = (Number(prod.pricePerUnit) * input.quantity).toString();

      await db.insert(orders).values({
        buyerId: ctx.user.id,
        productId: input.productId,
        quantity: input.quantity,
        totalPrice,
        status: "en attente",
        notes: input.notes || null,
      });

      return { success: true };
    }),

  // Update order status
  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum(["en attente", "confirmée", "en transit", "livrée"]),
        transporterId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const order = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (order.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

      const ord = order[0];

      // Verify permissions
      if (ctx.user.role === "agriculteur") {
        const prod = await db.select().from(products).where(eq(products.id, ord.productId)).limit(1);
        if (prod.length === 0 || prod[0].farmerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      } else if (ctx.user.role === "transporteur") {
        if (ord.transporterId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      } else if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updateData: Record<string, unknown> = { status: input.status };
      if (input.transporterId !== undefined) updateData.transporterId = input.transporterId;
      if (input.status === "livrée") updateData.actualDeliveryDate = new Date();

      await db.update(orders).set(updateData).where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  // Get order details
  getById: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const result = await db.select().from(orders).where(eq(orders.id, input)).limit(1);
    if (result.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

    return result[0];
  }),
});
