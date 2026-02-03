
import { db } from "./db";
import { scans, type InsertScan, type Scan } from "@shared/schema";

export interface IStorage {
  createScan(scan: InsertScan): Promise<Scan>;
  getScans(): Promise<Scan[]>;
}

export class DatabaseStorage implements IStorage {
  async createScan(scan: InsertScan): Promise<Scan> {
    const [newScan] = await db.insert(scans).values(scan).returning();
    return newScan;
  }

  async getScans(): Promise<Scan[]> {
    return await db.select().from(scans).orderBy(scans.createdAt);
  }
}

export const storage = new DatabaseStorage();
