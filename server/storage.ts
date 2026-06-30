import {
  users,
  contactSubmissions,
  type User,
  type InsertUser,
  type ContactSubmission,
  type InsertContact,
} from "@shared/schema";
import { db } from "./db";

function requireDb() {
  if (!db) throw new Error("Database not configured");
  return db;
}
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactSubmission(
    contact: InsertContact
  ): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await requireDb().select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await requireDb().select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await requireDb().insert(users).values(insertUser).returning();
    return user;
  }

  async createContactSubmission(insertContact: InsertContact): Promise<ContactSubmission> {
    const [submission] = await requireDb().insert(contactSubmissions).values(insertContact).returning();
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await requireDb().select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }
}

export const storage = new DatabaseStorage();
