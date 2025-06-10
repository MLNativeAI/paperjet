import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    /** We only specify the baseURL if we're running locally */
    ...(import.meta.env.DEV ? { baseURL: "http://localhost:3000" } : {}),

})