import { eq, and, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  InsertProduct, products, 
  InsertOrder, orders, 
  InsertMessage, messages, 
  InsertRating, ratings, 
  InsertNotification, notifications 
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── USERS ───

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod", "phone", "province", "bio", "profilePicture"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value !== undefined) {
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  });

  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (user.isVerified !== undefined) { values.isVerified = user.isVerified; updateSet.isVerified = user.isVerified; }
  if (user.rating !== undefined) { values.rating = user.rating; updateSet.rating = user.rating; }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── PRODUCTS ───

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result[0]?.insertId;
}

export async function getProductsByFarmerId(farmerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.farmerId, farmerId)).orderBy(desc(products.createdAt));
}

export async function getApprovedProducts(filters?: { province?: string; category?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(products).where(eq(products.isApproved, true));
  
  if (filters?.province) query = query.where(eq(products.province, filters.province));
  if (filters?.category) query = query.where(eq(products.category, filters.category));
  
  return query.orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ status: "supprimé" }).where(eq(products.id, id));
}

// ─── ORDERS ───

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return result[0]?.insertId;
}

export async function getOrdersByBuyerId(buyerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.buyerId, buyerId)).orderBy(desc(orders.createdAt));
}

export async function getOrdersByFarmerId(farmerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .where(eq(products.farmerId, farmerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set(data).where(eq(orders.id, id));
}

// ─── MESSAGES ───

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values(data);
  return result[0]?.insertId;
}

export async function getMessagesBetweenUsers(userId1: number, userId2: number, orderId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    sql`(${messages.senderId} = ${userId1} AND ${messages.recipientId} = ${userId2}) OR 
        (${messages.senderId} = ${userId2} AND ${messages.recipientId} = ${userId1})`
  ];
  if (orderId) conditions.push(eq(messages.orderId, orderId));
  
  return db.select().from(messages).where(and(...conditions)).orderBy(asc(messages.createdAt));
}

export async function markMessagesAsRead(senderId: number, recipientId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isRead: true }).where(
    and(eq(messages.senderId, senderId), eq(messages.recipientId, recipientId), eq(messages.isRead, false))
  );
}

export async function getUnreadMessagesCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(messages)
    .where(and(eq(messages.recipientId, userId), eq(messages.isRead, false)));
  return result[0]?.count ?? 0;
}

// ─── RATINGS ───

export async function createRating(data: InsertRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ratings).values(data);
  return result[0]?.insertId;
}

export async function getRatingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ratings).where(eq(ratings.ratedUserId, userId)).orderBy(desc(ratings.createdAt));
}

export async function getAverageRating(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ avg: sql<number>`avg(${ratings.rating})` }).from(ratings)
    .where(eq(ratings.ratedUserId, userId));
  return result[0]?.avg ?? 0;
}

// ─── NOTIFICATIONS ───

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result[0]?.insertId;
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function markNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function createUser(data: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values(data);
  return result[0]?.insertId;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}