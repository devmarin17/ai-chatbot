// Postgres Schema for the CRM


// Export Better-Auth schema tables
export * from './auth-schema';

// CRM Schema
import { pgTable, uuid, text, timestamp, integer, jsonb, boolean, pgEnum, serial } from 'drizzle-orm/pg-core';

// Enums for CRM
export const contactTypes = pgEnum('contact_type', ['prospect', 'student', 'parent', 'agent']);
export const appStages = pgEnum('app_stage', ['lead', 'applied', 'offer_sent', 'enrolled', 'rejected', 'withdrawn']);
export const logLevels = pgEnum('log_level', ['info', 'warning', 'error']);

// Contacts table - stores all people (prospects, students, parents, agents)
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  contactType: contactTypes('contact_type').notNull(),
  country: text('country'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Programs table - stores degree programs offered
export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(), // 'BSC_BP', 'BSC_DTM', 'BSC_CM'
  name: text('name').notNull(),
  degreeType: text('degree_type').notNull(),
  durationYears: integer('duration_years'),
  ectsTotal: integer('ects_total'),
  language: text('language'),
  studyMode: text('study_mode'),
  shortSummary: text('short_summary'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Applications table - links contacts to programs with stage tracking
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id').notNull().references(() => contacts.id),
  programId: uuid('program_id').notNull().references(() => programs.id),
  intakeTerm: text('intake_term'),
  stage: appStages('stage').notNull(),
  source: text('source'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Interactions table - communication history (emails, calls, meetings)
export const interactions = pgTable('interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id').notNull().references(() => contacts.id),
  applicationId: uuid('application_id').references(() => applications.id),
  channel: text('channel').notNull(), // 'email', 'phone', 'whatsapp', 'meeting'
  direction: text('direction').notNull(), // 'inbound', 'outbound'
  subject: text('subject'),
  bodySnippet: text('body_snippet'),
  status: text('status'),
  occurredAt: timestamp('occurred_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// FAQs table - frequently asked questions
export const faqs = pgTable('faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// School info table - general information about the school
export const schoolInfo = pgTable('school_info', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Logs table - system event logging
export const logs = pgTable('logs', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  level: logLevels('level').notNull(),
  source: text('source').notNull(),
  eventType: text('event_type').notNull(),
  contactId: uuid('contact_id').references(() => contacts.id),
  applicationId: uuid('application_id').references(() => applications.id),
  metadata: jsonb('metadata'),
});
