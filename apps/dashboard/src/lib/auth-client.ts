import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";


export const authClient = createAuthClient({
  /** We only specify the baseURL if we're running locally */
  ...(import.meta.env.DEV ? { baseURL: "http://localhost:3000" } : {}),
  plugins: [polarClient()],
});
