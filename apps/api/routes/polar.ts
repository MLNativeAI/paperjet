import { Hono } from "hono";
import { Checkout } from "@polar-sh/hono";
import { CustomerPortal } from "@polar-sh/hono";

const app = new Hono();

app.get(
    "/checkout",
    Checkout({
        successUrl: process.env.SUCCESS_URL,
        server: "sandbox", // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise
    })
);


app.get(
    "/portal",
    CustomerPortal({
        accessToken: "xxx", // Or set an environment variable to POLAR_ACCESS_TOKEN
        getCustomerId: (event) => "", // Function to resolve a Polar Customer ID
        server: "sandbox", // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise
    })
);

import { Webhooks } from "@polar-sh/hono";

app.post('/polar/webhooks', Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => /** Handle payload */,
}))