
import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  detectedObjects: jsonb("detected_objects").$type<string[]>(),
  sceneLabel: text("scene_label"),
  distanceData: jsonb("distance_data").$type<Record<string, number>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  createdAt: true,
});

export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;

export type AnalyzeRequest = {
  image: string; // Base64 encoded image
};

export type AnalyzeResponse = {
  objects: string[];
  distances: Record<string, number>;
  scene: string;
  feedback_text: string;
};
