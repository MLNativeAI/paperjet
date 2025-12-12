import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const queryClient = neon(
  Bun.env.DATABASE_URL ||
    (() => {
      throw new Error("DATABASE_URL is not defined");
    })(),
);

export const db = drizzle({ client: queryClient, schema });
