CREATE TABLE "app_role_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_app_role_name" UNIQUE("app_id","name")
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"client_id" text NOT NULL,
	"callback_urls" text[],
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "apps_name_unique" UNIQUE("name"),
	CONSTRAINT "apps_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "global_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "global_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"app_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"invited_by" text NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sync_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sync_type" text NOT NULL,
	"status" text NOT NULL,
	"users_synced" integer DEFAULT 0 NOT NULL,
	"error_detail" text,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_app_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_oid" text NOT NULL,
	"app_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"granted_by" text,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_app_role" UNIQUE("user_oid","app_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "user_global_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_oid" text NOT NULL,
	"role_id" uuid NOT NULL,
	"granted_by" text,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_global_role" UNIQUE("user_oid","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"oid" text PRIMARY KEY NOT NULL,
	"tid" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"type" text NOT NULL,
	"photo_url" text,
	"auth_user_id" uuid,
	"entra_synced" boolean DEFAULT false NOT NULL,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_role_definitions" ADD CONSTRAINT "app_role_definitions_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_role_id_app_role_definitions_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."app_role_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_app_roles" ADD CONSTRAINT "user_app_roles_user_oid_users_oid_fk" FOREIGN KEY ("user_oid") REFERENCES "public"."users"("oid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_app_roles" ADD CONSTRAINT "user_app_roles_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_app_roles" ADD CONSTRAINT "user_app_roles_role_id_app_role_definitions_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."app_role_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_app_roles" ADD CONSTRAINT "user_app_roles_granted_by_users_oid_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("oid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_global_roles" ADD CONSTRAINT "user_global_roles_user_oid_users_oid_fk" FOREIGN KEY ("user_oid") REFERENCES "public"."users"("oid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_global_roles" ADD CONSTRAINT "user_global_roles_role_id_global_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."global_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_global_roles" ADD CONSTRAINT "user_global_roles_granted_by_users_oid_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("oid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_app_role_def_app" ON "app_role_definitions" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "idx_invitations_email" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_invitations_token" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_user_app_roles_user" ON "user_app_roles" USING btree ("user_oid");--> statement-breakpoint
CREATE INDEX "idx_user_app_roles_app" ON "user_app_roles" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "idx_user_global_roles_user" ON "user_global_roles" USING btree ("user_oid");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_tid" ON "users" USING btree ("tid");