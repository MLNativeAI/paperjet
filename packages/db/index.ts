import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const queryClient = postgres(
  Bun.env.DATABASE_URL ||
    (() => {
      throw new Error("DATABASE_URL is not defined");
    })(),
);

export const db = drizzle({ client: queryClient, schema });
