// ── Input Sanitization ──
// Prevents XSS, SQL injection, script injection, HTML injection

const SCRIPT_PATTERN = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const HTML_TAGS = /<[^>]*>/g;
const SQL_PATTERNS = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|FROM|WHERE|OR\s+1\s*=\s*1|AND\s+1\s*=\s*1|TRUNCATE|GRANT|REVOKE|DECLARE|EXECUTE|CAST|CONVERT|CHAR\s*\(|NCHAR\s*\(|VARCHAR|NVARCHAR|TABLE|DATABASE|SCHEMA|INTO|VALUES)\b)/gi;
const EVENT_HANDLERS = /\bon\w+\s*=/gi;
const SPECIAL_CHARS = /[;'"\\`${}|<>]/g;
const NULL_BYTES = /\0/g;
const UNICODE_ESCAPES = /\\u[\da-fA-F]{4}/g;
const PROTO_POLLUTION = /__proto__|constructor|prototype/gi;

function deepClean(input: string): string {
  return input
    .replace(NULL_BYTES, '')
    .replace(UNICODE_ESCAPES, '')
    .replace(SCRIPT_PATTERN, '')
    .replace(HTML_TAGS, '')
    .replace(EVENT_HANDLERS, '')
    .replace(SQL_PATTERNS, '')
    .replace(PROTO_POLLUTION, '')
    .replace(SPECIAL_CHARS, '')
    .trim();
}

export function sanitize(input: string, maxLen = 500): string {
  if (!input || typeof input !== 'string') return '';
  return deepClean(input).slice(0, maxLen);
}

export function sanitizeCode(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 20);
}

export function sanitizeUTR(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[^A-Za-z0-9]/g, '').slice(0, 30);
}

export function isValidUTR(utr: string): boolean {
  const clean = sanitizeUTR(utr);
  return clean.length >= 6 && clean.length <= 30;
}

export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const clean = input.trim();
  if (clean.startsWith('javascript:') || clean.startsWith('data:') || clean.startsWith('vbscript:')) return '';
  try { new URL(clean); return clean; } catch { return ''; }
}

export function sanitizeNumber(input: unknown): number {
  const n = Number(input);
  if (!Number.isFinite(n) || n < 0 || n > 99999999) return 0;
  return Math.round(n * 100) / 100;
}

// ── Rate Limiter ──
const actionTimestamps: Record<string, number[]> = {};

export function rateLimit(action: string, maxPerMinute: number): boolean {
  const now = Date.now();
  if (!actionTimestamps[action]) actionTimestamps[action] = [];
  actionTimestamps[action] = actionTimestamps[action].filter(t => now - t < 60000);
  if (actionTimestamps[action].length >= maxPerMinute) return false;
  actionTimestamps[action].push(now);
  return true;
}
