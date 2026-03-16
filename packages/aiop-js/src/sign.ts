/**
 * AioP v0.1 — Signing
 *
 * HMAC-SHA256 signing and verification.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sign a proof hash using HMAC-SHA256.
 *
 * @param proofHash - The proof_hash hex string to sign
 * @param secret - HMAC secret key
 * @returns Base64-encoded signature
 */
export function signProof(proofHash: string, secret: string): string {
  return createHmac('sha256', secret).update(proofHash, 'utf8').digest('base64');
}

/**
 * Verify an HMAC-SHA256 signature using constant-time comparison.
 *
 * @param proofHash - The proof_hash hex string
 * @param signature - Base64-encoded signature to verify
 * @param secret - HMAC secret key
 * @returns true if signature is valid
 */
export function verifySignature(proofHash: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(proofHash, 'utf8').digest();
  const actual = Buffer.from(signature, 'base64');

  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}
