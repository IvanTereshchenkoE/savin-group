CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" text NOT NULL,
	"action" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "city_settings" (
	"city_code" varchar(10) PRIMARY KEY NOT NULL,
	"city_name" varchar(100) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"telegram_url" text NOT NULL,
	"max_url" text NOT NULL,
	"hero_title" text NOT NULL,
	"hero_text" text NOT NULL,
	"seo_title" text NOT NULL,
	"seo_description" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"city" varchar(10),
	"type" varchar(50) NOT NULL,
	"data" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'PUBLISHED' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lead_calculation_snapshots" (
	"lead_id" uuid PRIMARY KEY NOT NULL,
	"price_list_version_id" varchar(100) NOT NULL,
	"algorithm_version" varchar(20) NOT NULL,
	"input" jsonb NOT NULL,
	"result" jsonb NOT NULL,
	"total_min_kopeks" integer NOT NULL,
	"total_max_kopeks" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_number" varchar(50) NOT NULL,
	"idempotency_key" varchar(100) NOT NULL,
	"type" varchar(30) DEFAULT 'CALCULATOR' NOT NULL,
	"city" varchar(10) NOT NULL,
	"name" text,
	"phone_e164" varchar(30) NOT NULL,
	"comment" text,
	"source_path" text,
	"utm" jsonb,
	"status" varchar(30) DEFAULT 'NEW' NOT NULL,
	"consent_document_version" varchar(50) DEFAULT 'v1.0' NOT NULL,
	"consented_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_public_number_unique" UNIQUE("public_number"),
	CONSTRAINT "leads_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"web_path" text NOT NULL,
	"original_name" text NOT NULL,
	"mime" varchar(100) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"bytes" integer NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"channel" varchar(20) DEFAULT 'TELEGRAM' NOT NULL,
	"status" varchar(30) DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_error_code" text,
	"telegram_message_id" varchar(100),
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "price_list_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"service_code" varchar(100) NOT NULL,
	"min_price_kopeks" integer NOT NULL,
	"max_price_kopeks" integer,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"needs_approval" boolean DEFAULT false NOT NULL,
	"modifier_configuration" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "price_list_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" varchar(10) NOT NULL,
	"version_number" integer NOT NULL,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"algorithm_version" varchar(20) DEFAULT '1.0.0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_media" (
	"project_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'GALLERY' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_media_project_id_media_id_role_pk" PRIMARY KEY("project_id","media_id","role")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"city" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"service_tags" jsonb DEFAULT '[]'::jsonb,
	"area_m2" numeric(10, 2),
	"duration_days" integer,
	"completed_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"hero_media_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"unit" varchar(20) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_composite" boolean DEFAULT false NOT NULL,
	"height_affected" boolean DEFAULT false NOT NULL,
	"supported_options" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(50) DEFAULT 'OWNER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "lead_calculation_snapshots" ADD CONSTRAINT "lead_calculation_snapshots_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_outbox" ADD CONSTRAINT "notification_outbox_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_version_id_price_list_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."price_list_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_list_versions" ADD CONSTRAINT "price_list_versions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_media_id_media_files_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_hero_media_id_media_files_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_status_created_idx" ON "leads" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "leads_city_created_idx" ON "leads" USING btree ("city","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_outbox_lead_channel_idx" ON "notification_outbox" USING btree ("lead_id","channel");--> statement-breakpoint
CREATE INDEX "notification_outbox_status_next_idx" ON "notification_outbox" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE UNIQUE INDEX "price_list_items_version_service_idx" ON "price_list_items" USING btree ("version_id","service_code");--> statement-breakpoint
CREATE INDEX "price_list_versions_city_status_idx" ON "price_list_versions" USING btree ("city","status");--> statement-breakpoint
CREATE UNIQUE INDEX "price_list_versions_city_version_idx" ON "price_list_versions" USING btree ("city","version_number");--> statement-breakpoint
CREATE INDEX "projects_city_status_idx" ON "projects" USING btree ("city","status","sort_order");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");