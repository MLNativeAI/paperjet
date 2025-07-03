import { google } from "@ai-sdk/google";

export const aiSdkModel = () => {
    const apiKey = Bun.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        throw new Error("Google API key not configured");
    }

    return google("gemini-2.5-flash");
};
