// Auth mode detection utility
// This is determined by the server-side AUTH_MODE env variable
// We'll fetch this from an API endpoint that exposes the mode

export type AuthMode = "classic" | "saas";

// Store the mode in memory after first fetch
let cachedMode: AuthMode | null = null;

export async function getAuthMode(): Promise<AuthMode> {
  if (cachedMode) {
    return cachedMode;
  }

  try {
    const response = await fetch("/api/auth/mode");
    const data = await response.json();
    cachedMode = data.mode || "classic";
    return cachedMode;
  } catch (error) {
    console.error("Failed to fetch auth mode, defaulting to classic:", error);
    return "classic";
  }
}

// For use in components that need synchronous access
// Call getAuthMode() first during app initialization
export function getCachedAuthMode(): AuthMode {
  return cachedMode || "classic";
}