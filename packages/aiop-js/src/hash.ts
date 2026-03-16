/**
 * AioP v0.1 — Hashing
 *
 * SHA-256 over canonical JSON representations.
 */

import { createHash } from 'node:crypto';
import { canonicalize } from './canonicalize.js';

/**
 * Compute SHA-256 hex hash of the canonical JSON representation of a value.
 *
 * @param value - Any JSON-serializable value
 * @returns Lowercase hex string (64 chars)
 */
export function hashCanonical(value: unknown): string {
  const canonical = canonicalize(value);
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}
