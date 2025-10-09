// Helper function to check if a path matches a pattern with wildcards
export const matchesPattern = (path: string, pattern: string): boolean => {
  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -2); // Remove /** from the end
    return path.startsWith(prefix);
  }
  return path === pattern;
};
