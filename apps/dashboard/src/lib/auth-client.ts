import type { auth } from "@paperjet/auth";
import { polarClient } from "@polar-sh/better-auth";
import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  /** We only specify the baseURL if we're running locally */
  ...(import.meta.env.DEV ? { baseURL: "http://localhost:3000" } : {}),
  plugins: [
    polarClient(),
    apiKeyClient(),
    organizationClient(),
    magicLinkClient(),
    adminClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
