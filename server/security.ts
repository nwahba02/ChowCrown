import crypto from 'node:crypto';

/**
 * Ensures a value from req.body / req.query is a plain string, not an object
 * injected via qs parsing (e.g. ?id[$ne]=x → { $ne: 'x' }).
 * Returns the string or undefined if the value is absent.
 * Throws if the value is present but not a string.
 */
export function requireString(val: unknown, field: string): string {
  if (typeof val !== 'string') {
    throw Object.assign(new Error(`${field} must be a string`), { status: 400 });
  }
  return val;
}

export function optionalString(val: unknown, field: string): string | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val !== 'string') {
    throw Object.assign(new Error(`${field} must be a string`), { status: 400 });
  }
  return val;
}

export function requireBoolean(val: unknown, field: string): boolean {
  if (typeof val !== 'boolean') {
    throw Object.assign(new Error(`${field} must be a boolean`), { status: 400 });
  }
  return val;
}

export function optionalBoolean(val: unknown, field: string): boolean | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val !== 'boolean') {
    throw Object.assign(new Error(`${field} must be a boolean`), { status: 400 });
  }
  return val;
}

/** Constant-time string comparison to prevent timing attacks on secrets. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Run the comparison anyway to avoid leaking length via timing.
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
