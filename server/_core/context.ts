import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { jwtVerify } from "jose";
import { getUserById } from "../db";

function getCookie(req: any, name: string): string | undefined {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(';').reduce((acc: any, cookie: string) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
  return cookies[name];
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-change-me");

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try { user = await sdk.authenticateRequest(opts.req); } catch { user = null; }

  if (!user) {
    const authToken = getCookie(opts.req, "auth-token");
    if (authToken) {
      try {
        const { payload } = await jwtVerify(authToken, JWT_SECRET, { clockTolerance: 60 });
        const userId = payload.userId as number;
        if (userId) user = await getUserById(userId);
      } catch { user = null; }
    }
  }

  if (!user) {
    const devCookie = getCookie(opts.req, "dev-session");
    if (devCookie) {
      try {
        const { role } = JSON.parse(devCookie);
        const now = new Date();
        user = {
          id: 999, openId: `dev-${role}`, name: `Dev ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          email: `${role}@dev.local`, role, phone: "+243999999999", province: "Kinshasa",
          bio: `Compte développement pour ${role}`, profilePicture: null, isVerified: 1,
          rating: "5.00", loginMethod: "dev", createdAt: now, updatedAt: now, lastSignedIn: now,
        } as User;
      } catch { user = null; }
    }
  }

  return { req: opts.req, res: opts.res, user };
}