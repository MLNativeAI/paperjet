import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: process.env.NODE_ENV === "production" ? "/usr/src/app/packages/db/migrations" : "../packages/db/migrations",
    schema: process.env.NODE_ENV === "production" ? "/usr/src/app/packages/db/schema.ts" : "../packages/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
