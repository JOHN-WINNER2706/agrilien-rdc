import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";

export const devRouter = router({
  login: publicProcedure
    .input(z.object({
      role: z.enum(["agriculteur", "grossiste", "transporteur", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const cookieValue = JSON.stringify({ role: input.role });
      
      ctx.res.cookie("dev-session", cookieValue, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return { 
        success: true, 
        role: input.role,
        redirectTo: `/dashboard/${input.role}` 
      };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie("dev-session", { path: "/" });
    return { success: true };
  }),
});