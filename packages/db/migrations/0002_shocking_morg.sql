CREATE TABLE "usage_data" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"model" text NOT NULL,
	"user_id" text,
	"workflow_id" text,
	"execution_id" text,
	"input_tokens" integer NOT NULL,
	"input_cost" numeric,
	"output_tokens" integer NOT NULL,
	"output_cost" numeric,
	"total_tokens" integer NOT NULL,
	"total_cost" numeric(10, 4),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_model_price" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model" text NOT NULL,
	"input_cost_per_million_tokens" numeric(10, 4) NOT NULL,
	"output_cost_per_million_tokens" numeric(10, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "usage_model_price" ("model", "input_cost_per_million_tokens", "output_cost_per_million_tokens") VALUES ('gemini-2.5-flash', 0.30, 2.50);
