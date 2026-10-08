CREATE TABLE "poll_options" (
	"id" serial PRIMARY KEY,
	"poll_id" text NOT NULL,
	"label" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" text PRIMARY KEY,
	"question" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"total_votes" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY,
	"poll_id" text NOT NULL,
	"option_id" integer NOT NULL,
	"voter_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "poll_options_poll_id_idx" ON "poll_options" ("poll_id");--> statement-breakpoint
CREATE INDEX "polls_created_at_idx" ON "polls" ("created_at");--> statement-breakpoint
CREATE INDEX "polls_total_votes_idx" ON "polls" ("total_votes");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_poll_voter_idx" ON "votes" ("poll_id","voter_id");--> statement-breakpoint
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_poll_id_polls_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_polls_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_option_id_poll_options_id_fkey" FOREIGN KEY ("option_id") REFERENCES "poll_options"("id") ON DELETE CASCADE;