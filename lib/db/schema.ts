import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// User table - minimal for guest authentication
export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  type: varchar("type", { enum: ["guest", "regular"] })
    .notNull()
    .default("guest"),
});

export type User = InferSelectModel<typeof user>;

// CRM Tables - For student information queries

// Programs table - stores degree programs offered
export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  degreeType: text("degree_type").notNull(),
  durationYears: integer("duration_years"),
  ectsTotal: integer("ects_total"),
  language: text("language"),
  studyMode: text("study_mode"),
  shortSummary: text("short_summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Program = InferSelectModel<typeof programs>;

// FAQs table - frequently asked questions
export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type FAQ = InferSelectModel<typeof faqs>;

// School info table - general information about the school
export const schoolInfo = pgTable("school_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SchoolInfo = InferSelectModel<typeof schoolInfo>;
