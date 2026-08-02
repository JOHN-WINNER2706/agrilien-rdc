import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { productsRouter } from "./routers/products";
import { ordersRouter } from "./routers/orders";
import { messagesRouter } from "./routers/messages";
import { ratingsRouter } from "./routers/ratings";
import { usersRouter } from "./routers/users";
import { devRouter } from "./routers/dev";
import { updateUser, getUserByOpenId, upsertUser } from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createHash } from "crypto";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie("dev-session", { path: "/" });
      return { success: true } as const;
    }),

    register: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().min(8),
        province: z.string().optional(),
        role: z.enum(["agriculteur", "grossiste", "transporteur"]),
        password: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const openId = `local-${input.phone}`;
        const existing = await getUserByOpenId(openId);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Ce numéro est déjà utilisé" });
        }

        const passwordHash = createHash("sha256").update(input.password).digest("hex");

        await upsertUser({
          openId,
          name: input.name,
          email: input.email || undefined,
          phone: input.phone,
          province: input.province,
          role: input.role,
          loginMethod: "local",
          bio: passwordHash,
        });

        return { success: true };
      }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        province: z.string().optional(),
        bio: z.string().optional(),
        role: z.enum(["agriculteur", "grossiste", "transporteur"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUser(ctx.user.id, input);
        return { success: true };
      }),
  }),

  dev: devRouter,
  products: productsRouter,
  orders: ordersRouter,
  messages: messagesRouter,
  ratings: ratingsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;