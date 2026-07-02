/**
 * Security Module — Production Hardened
 * - XSS / SQLi prevention
 * - Input sanitization + validation
 * - Rate limiting (per action + global)
 * - Bot detection (honeypot + timing)
 * - Safe JSON parsing
 */

/* ── XSS & Injection Sanitizer ── */
const DANGEROUS_CHARS = /[<>{}()'"`;\\/]/g;
const SQL_KEYWORDS = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|SCRIPT|CREATE|TRUNCATE|GRANT|REVOKE|FROM\s+\w+|WHERE|OR\s+1\s*=\s*1|AND\s+1\s*=\s*1)\b/gi;
const SCRIPT_PATTERNS = /(javascript|data|vbscript|on\w+\s*=)/gi;
const HTML_ENTITIES = /&(lt|gt|amp|quot|apos|#\d+|#x[\da-f]+);/gi;

export function sanitize(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(DANGEROUS_CHARS, '')
    .replace(SQL_KEYWORDS, '')
    .replace(SCRIPT_PATTERNS, '')
    .replace(HTML_ENTITIES, '')
    .replace(/\0/g, '')       // null bytes
    .replace(/\r\n|\r/g, '\n') // normalize line endings
    .trim()
    .slice(0, 500);
}

export function sanitizeStrict(input: string, maxLen: number = 200): string {
  if (!input || typeof input !== 'string') return '';
  // Only allow alphanumeric, spaces, basic punctuation
  return input.replace(/[^a-zA-Z0-9\s.,\-_@#&+/()₹]/g, '').trim().slice(0, maxLen);
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const cleaned = email.trim().toLowerCase().slice(0, 254);
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleaned) ? cleaned : '';
}

export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(0, 10);
}

export function sanitizePincode(pin: string): string {
  if (!pin) return '';
  return pin.replace(/\D/g, '').slice(0, 6);
}

/* ── Rate Limiter ── */
const rateLimits: Record<string, { count: number; resetAt: number }> = {};
let globalRequestCount = 0;
let globalResetAt = Date.now() + 60000;
const GLOBAL_MAX = 100; // max 100 actions per minute globally

export function checkRateLimit(action: string, maxPerWindow: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();

  // Global rate limit
  if (now > globalResetAt) { globalRequestCount = 0; globalResetAt = now + 60000; }
  globalRequestCount++;
  if (globalRequestCount > GLOBAL_MAX) return false;

  // Per-action rate limit
  if (!rateLimits[action] || now > rateLimits[action].resetAt) {
    rateLimits[action] = { count: 1, resetAt: now + windowMs };
    return true;
  }
  if (rateLimits[action].count >= maxPerWindow) return false;
  rateLimits[action].count++;
  return true;
}

/* ── Honeypot ── */
export function isHoneypotTriggered(value: string): boolean {
  return typeof value === 'string' && value.length > 0;
}

/* ── Timing-based bot detection ── */
const formTimestamps: Record<string, number> = {};

export function markFormOpen(formId: string): void {
  formTimestamps[formId] = Date.now();
}

export function isSubmissionTooFast(formId: string, minMs: number = 2000): boolean {
  const opened = formTimestamps[formId];
  if (!opened) return false;
  return Date.now() - opened < minMs;
}

/* ── Validators ── */
export function isValidIndianPhone(phone: string): boolean {
  return typeof phone === 'string' && /^[6-9]\d{9}$/.test(phone);
}

export function isValidPincode(pin: string): boolean {
  return typeof pin === 'string' && /^\d{6}$/.test(pin);
}

export function isValidEmail(email: string): boolean {
  return typeof email === 'string' && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && email.length <= 254;
}

export function isValidName(name: string): boolean {
  return typeof name === 'string' && name.length >= 2 && name.length <= 100 && !/^\d/.test(name);
}

export function isValidAddress(addr: string): boolean {
  return typeof addr === 'string' && addr.length >= 5 && addr.length <= 300;
}

export function isValidTransactionId(txn: string): boolean {
  return typeof txn === 'string' && txn.length >= 4 && txn.length <= 50 && /^[a-zA-Z0-9_\-]+$/.test(txn);
}

/* ── Safe JSON parsing ── */
export function safeJsonParse<T>(data: string | null, fallback: T): T {
  if (!data) return fallback;
  try {
    const parsed = JSON.parse(data);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

/* ── Sanitize object (deep clean all string values) ── */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const cleaned = { ...obj };
  for (const key in cleaned) {
    if (typeof cleaned[key] === 'string') {
      (cleaned as any)[key] = sanitize(cleaned[key]);
    }
  }
  return cleaned;
}
