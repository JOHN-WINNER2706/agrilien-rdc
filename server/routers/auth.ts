import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getUserById, updateUser, getUserByEmail, createUser } from "../db";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-change-me");

export const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  
  logout: publicProcedure.mutation(({ ctx }) => {
    const { COOKIE_NAME } = require("@shared/const");
    const { getSessionCookieOptions } = require("../_core/cookies");
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    ctx.res.clearCookie("auth-token", { path: "/" });
    ctx.res.clearCookie("dev-session", { path: "/" });
    return { success: true } as const;
  }),

  register: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      phone: z.string().optional(),
      province: z.string().optional(),
      role: z.enum(["agriculteur", "grossiste", "transporteur"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getUserByEmail(input.email);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Cet email est déjà utilisé" });
      
      const passwordHash = await new SignJWT({ password: input.password })
        .setProtectedHeader({ alg: "HS256" })
        .sign(JWT_SECRET);
      
      const userId = await createUser({
        openId: input.email,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        province: input.province || null,
        role: input.role,
        passwordHash,
        loginMethod: "local",
      });
      
      if (!userId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur création compte" });
      
      const token = await new SignJWT({ userId: Number(userId), email: input.email })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);
      
      ctx.res.cookie("auth-token", token, {
        httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, path: "/",
        sameSite: "lax", secure: process.env.NODE_ENV === "production",
      });
      
      return { success: true, userId: Number(userId) };
    }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(input.email);
      if (!user || !user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou mot de passe incorrect" });
      
      try {
        const { payload } = await jwtVerify(user.passwordHash, JWT_SECRET, { clockTolerance: 60 });
        if ((payload as any).password !== input.password) throw new Error();
      } catch {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou mot de passe incorrect" });
      }
      
      const token = await new SignJWT({ userId: user.id, email: user.email })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);
      
      ctx.res.cookie("auth-token", token, {
        httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, path: "/",
        sameSite: "lax", secure: process.env.NODE_ENV === "production",
      });
      
      return { success: true, user };
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      phone: z.string().optional(),
      province: z.string().optional(),
      bio: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await updateUser(ctx.user.id, input);
      return { success: true };
    }),
});