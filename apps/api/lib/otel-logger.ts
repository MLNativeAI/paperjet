import { logs, SeverityNumber } from "@opentelemetry/api-logs";

// Get the global logger
const otelLogger = logs.getLogger("paperjet-api", "1.0.0");

// Helper function to emit structured logs
export function log(
  level: "debug" | "info" | "warn" | "error",
  message: string,
  attributes?: Record<string, any>,
) {
  const severityNumber = {
    debug: SeverityNumber.DEBUG,
    info: SeverityNumber.INFO,
    warn: SeverityNumber.WARN,
    error: SeverityNumber.ERROR,
  }[level];

  otelLogger.emit({
    severityNumber,
    severityText: level.toUpperCase(),
    body: message,
    attributes: attributes || {},
  });
}

// Convenience methods
export const logger = {
  debug: (message: string, attributes?: Record<string, any>) =>
    log("debug", message, attributes),
  info: (message: string, attributes?: Record<string, any>) =>
    log("info", message, attributes),
  warn: (message: string, attributes?: Record<string, any>) =>
    log("warn", message, attributes),
  error: (message: string, attributes?: Record<string, any>) =>
    log("error", message, attributes),
};
