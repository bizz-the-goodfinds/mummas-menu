/**
 * Minimal structured logger for server code and scripts.
 *
 * Dev: pretty single-line output. Production: JSON lines, ready for any log
 * collector (Vercel captures stdout/stderr per request).
 *
 *   const log = logger.child("orders");
 *   log.info("order logged", { id });
 *   log.error("insert failed", { id, error: e.message });
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const minLevel: Level = (process.env.LOG_LEVEL as Level) || "info";
const isPretty = process.env.NODE_ENV !== "production";

function write(level: Level, scope: string, message: string, meta?: Record<string, unknown>) {
  if (LEVEL_RANK[level] < LEVEL_RANK[minLevel]) return;
  const out = level === "error" || level === "warn" ? console.error : console.log;
  const time = new Date().toISOString();

  if (isPretty) {
    const metaStr = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    out(`[${time}] ${level.toUpperCase().padEnd(5)} [${scope}] ${message}${metaStr}`);
  } else {
    out(JSON.stringify({ time, level, scope, message, ...meta }));
  }
}

export interface Logger {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  child: (scope: string) => Logger;
}

function make(scope: string): Logger {
  return {
    debug: (m, meta) => write("debug", scope, m, meta),
    info: (m, meta) => write("info", scope, m, meta),
    warn: (m, meta) => write("warn", scope, m, meta),
    error: (m, meta) => write("error", scope, m, meta),
    child: (sub) => make(scope === "app" ? sub : `${scope}:${sub}`),
  };
}

export const logger = make("app");
