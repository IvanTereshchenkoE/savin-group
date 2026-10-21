import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
  uniqueIndex,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';

// 1. Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('OWNER'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// 2. Sessions (Secure DB sessions)
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('sessions_token_idx').on(table.token)],
);

// 3. Settings (Company, Default SEO, Contacts)
export const settings = pgTable('settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 4. City Settings (SPB & NN independent settings)
export const citySettings = pgTable('city_settings', {
  cityCode: varchar('city_code', { length: 10 }).primaryKey(), // 'spb' | 'nn'
  cityName: varchar('city_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  telegramUrl: text('telegram_url').notNull(),
  maxUrl: text('max_url').notNull(),
  heroTitle: text('hero_title').notNull(),
  heroText: text('hero_text').notNull(),
  seoTitle: text('seo_title').notNull(),
  seoDescription: text('seo_description').notNull(),
  active: boolean('active').notNull().default(true),
});

// 5. Services Catalog
export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 50 }).notNull(), // 'gkl' | 'painting'
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  unit: varchar('unit', { length: 20 }).notNull(), // 'M2' | 'LINEAR_M' | 'PCS'
  sortOrder: integer('sort_order').notNull().default(0),
  isComposite: boolean('is_composite').notNull().default(false),
  heightAffected: boolean('height_affected').notNull().default(false),
  supportedOptions: jsonb('supported_options').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// 6. Price List Versions
export const priceListVersions = pgTable(
  'price_list_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    city: varchar('city', { length: 10 }).notNull(), // 'spb' | 'nn'
    versionNumber: integer('version_number').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT'), // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    publishedAt: timestamp('published_at', { withTimezone: true }),
    publishedBy: uuid('published_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    algorithmVersion: varchar('algorithm_version', { length: 20 }).notNull().default('1.0.0'),
  },
  (table) => [
    index('price_list_versions_city_status_idx').on(table.city, table.status),
    uniqueIndex('price_list_versions_city_version_idx').on(table.city, table.versionNumber),
  ],
);

// 7. Price List Items
export const priceListItems = pgTable(
  'price_list_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => priceListVersions.id, { onDelete: 'cascade' }),
    serviceCode: varchar('service_code', { length: 100 }).notNull(),
    minPriceKopeks: integer('min_price_kopeks').notNull(),
    maxPriceKopeks: integer('max_price_kopeks'), // null = unknown upper boundary
    isEnabled: boolean('is_enabled').notNull().default(true),
    needsApproval: boolean('needs_approval').notNull().default(false),
    modifierConfiguration: jsonb('modifier_configuration').default({}),
  },
  (table) => [
    uniqueIndex('price_list_items_version_service_idx').on(table.versionId, table.serviceCode),
  ],
);

// 8. Content Blocks
export const contentBlocks = pgTable('content_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull(),
  city: varchar('city', { length: 10 }), // null = global
  type: varchar('type', { length: 50 }).notNull(),
  data: jsonb('data').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PUBLISHED'),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
});

// 9. Media Files
export const mediaFiles = pgTable('media_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  path: text('path').notNull(),
  webPath: text('web_path').notNull(),
  originalName: text('original_name').notNull(),
  mime: varchar('mime', { length: 100 }).notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  bytes: integer('bytes').notNull(),
  alt: text('alt').notNull().default(''),
  checksum: varchar('checksum', { length: 64 }).notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});

// 10. Portfolio Projects
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    city: varchar('city', { length: 10 }).notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    serviceTags: jsonb('service_tags').default([]),
    areaM2: numeric('area_m2', { precision: 10, scale: 2 }),
    durationDays: integer('duration_days'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
    sortOrder: integer('sort_order').notNull().default(0),
    heroMediaId: uuid('hero_media_id').references(() => mediaFiles.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('projects_city_status_idx').on(table.city, table.status, table.sortOrder)],
);

// 11. Project Media Linking
export const projectMedia = pgTable(
  'project_media',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => mediaFiles.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).notNull().default('GALLERY'), // 'BEFORE' | 'AFTER' | 'GALLERY'
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.mediaId, table.role] })],
);

// 12. Leads
export const leads = pgTable(
  'leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    publicNumber: varchar('public_number', { length: 50 }).notNull().unique(),
    idempotencyKey: varchar('idempotency_key', { length: 100 }).notNull().unique(),
    type: varchar('type', { length: 30 }).notNull().default('CALCULATOR'), // 'CALCULATOR' | 'CALLBACK' | 'CASE' | 'CONTACT'
    city: varchar('city', { length: 10 }).notNull(),
    name: text('name'),
    phoneE164: varchar('phone_e164', { length: 30 }).notNull(),
    comment: text('comment'),
    sourcePath: text('source_path'),
    utm: jsonb('utm'),
    status: varchar('status', { length: 30 }).notNull().default('NEW'), // 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED'
    consentDocumentVersion: varchar('consent_document_version', { length: 50 })
      .notNull()
      .default('v1.0'),
    consentedAt: timestamp('consented_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('leads_created_at_idx').on(table.createdAt),
    index('leads_status_created_idx').on(table.status, table.createdAt),
    index('leads_city_created_idx').on(table.city, table.createdAt),
  ],
);

// 13. Lead Calculation Snapshots (Immutable after creation)
export const leadCalculationSnapshots = pgTable('lead_calculation_snapshots', {
  leadId: uuid('lead_id')
    .primaryKey()
    .references(() => leads.id, { onDelete: 'cascade' }),
  priceListVersionId: varchar('price_list_version_id', { length: 100 }).notNull(),
  algorithmVersion: varchar('algorithm_version', { length: 20 }).notNull(),
  input: jsonb('input').notNull(),
  result: jsonb('result').notNull(),
  totalMinKopeks: integer('total_min_kopeks').notNull(),
  totalMaxKopeks: integer('total_max_kopeks'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// 14. Notification Outbox
export const notificationOutbox = pgTable(
  'notification_outbox',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    channel: varchar('channel', { length: 20 }).notNull().default('TELEGRAM'),
    status: varchar('status', { length: 30 }).notNull().default('PENDING'), // 'PENDING' | 'SENT' | 'FAILED_RETRYABLE' | 'NEEDS_ATTENTION'
    attempts: integer('attempts').notNull().default(0),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }).notNull().defaultNow(),
    lastErrorCode: text('last_error_code'),
    telegramMessageId: varchar('telegram_message_id', { length: 100 }),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('notification_outbox_lead_channel_idx').on(table.leadId, table.channel),
    index('notification_outbox_status_next_idx').on(table.status, table.nextAttemptAt),
  ],
);

// 15. Audit Log (No PII, No passwords, No bot secrets)
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id'),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: text('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb('metadata'),
});
