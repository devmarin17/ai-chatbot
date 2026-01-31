import "server-only";

import { tool } from "ai";
import { and, eq, ilike, type SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";
import { faqs, programs, schoolInfo } from "@/lib/db/schema";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

// Allowed tables for security
const ALLOWED_TABLES = ["programs", "faqs", "schoolInfo"] as const;

// Map of table names to actual table objects
const TABLE_MAP = {
  programs,
  faqs,
  schoolInfo,
} as const;

export const queryDatabase = tool({
  description:
    "Query the school database for information about programs, FAQs, or general school information. Use this to answer student questions with accurate data from the database.",
  inputSchema: z.object({
    table: z
      .enum(ALLOWED_TABLES)
      .describe(
        "The table to query: 'programs' for degree programs, 'faqs' for frequently asked questions, 'schoolInfo' for general school information"
      ),
    searchText: z
      .string()
      .optional()
      .describe(
        "Optional text to search for in the table (searches across text fields)"
      ),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Maximum number of results to return (default: 10, max: 50)"),
    category: z.string().optional().describe("For FAQs: filter by category"),
    code: z
      .string()
      .optional()
      .describe("For programs: filter by program code"),
    key: z
      .string()
      .optional()
      .describe("For schoolInfo: filter by specific key"),
  }),
  needsApproval: false,
  execute: async (input) => {
    const { table, searchText, limit = 10, category, code, key } = input;

    // Security: ensure only allowed tables
    if (!ALLOWED_TABLES.includes(table)) {
      return {
        error:
          "Access denied. You can only query programs, faqs, or schoolInfo tables.",
        count: 0,
        results: [],
      };
    }

    // Limit max results to 50
    const maxLimit = Math.min(limit, 50);

    try {
      const tableObj = TABLE_MAP[table];
      const conditions: SQL[] = [];

      // Build query conditions based on table and filters
      if (table === "programs") {
        if (code) {
          conditions.push(eq(programs.code, code));
        }
        if (searchText) {
          conditions.push(ilike(programs.name, `%${searchText}%`));
        }
      } else if (table === "faqs") {
        // Only return active FAQs
        conditions.push(eq(faqs.isActive, true));

        if (category) {
          conditions.push(eq(faqs.category, category));
        }
        if (searchText) {
          conditions.push(ilike(faqs.question, `%${searchText}%`));
        }
      } else if (table === "schoolInfo") {
        if (key) {
          conditions.push(eq(schoolInfo.key, key));
        }
        if (searchText) {
          conditions.push(ilike(schoolInfo.title, `%${searchText}%`));
        }
      }

      // Execute query
      const query =
        conditions.length > 0
          ? db
              .select()
              .from(tableObj)
              .where(and(...conditions))
              .limit(maxLimit)
          : db.select().from(tableObj).limit(maxLimit);

      const results = await query;

      return {
        table,
        count: results.length,
        results,
        message:
          results.length === 0
            ? `No results found in ${table}${searchText ? ` matching "${searchText}"` : ""}`
            : undefined,
      };
    } catch (_error) {
      return {
        error: `Failed to query ${table} table. Please try again.`,
        count: 0,
        results: [],
      };
    }
  },
});
