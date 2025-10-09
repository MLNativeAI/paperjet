import { formatDistance, subDays } from "date-fns";

export function formatDuration(startedAt: string, completedAt?: string | null): string {
  if (!completedAt) {
    return "Running...";
  }

  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const durationMs = end.getTime() - start.getTime();

  if (durationMs < 1000) {
    return "< 1s";
  }

  const seconds = Math.floor(durationMs / 1000) % 60;
  const minutes = Math.floor(durationMs / 60000) % 60;
  const hours = Math.floor(durationMs / 3600000);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString();
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}

export function getInvitationSendDate(expiryDate: Date) {
  // this is a small hack to derive the invite send date from the expiry date based on th expiry period (which is 2 days by default)
  return subDays(expiryDate, 2);
}

export function renderTimestamp(date: Date): string {
  return formatDistance(date, new Date(), { addSuffix: true });
}
