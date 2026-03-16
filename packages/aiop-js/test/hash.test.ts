import { describe, it, expect } from 'vitest';
import { hashCanonical } from '../src/hash.js';

describe('hashCanonical', () => {
  it('produces correct SHA-256 for empty object', () => {
    // SHA-256 of "{}" — well-known value
    expect(hashCanonical({}))
      .toBe('44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a');
  });

  it('produces consistent hash for sorted keys', () => {
    // {b:1, a:2} and {a:2, b:1} must produce the same hash
    const hash1 = hashCanonical({ b: 1, a: 2 });
    const hash2 = hashCanonical({ a: 2, b: 1 });
    expect(hash1).toBe(hash2);
  });

  it('produces 64-char lowercase hex', () => {
    const hash = hashCanonical({ test: true });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('different inputs produce different hashes', () => {
    const h1 = hashCanonical({ a: 1 });
    const h2 = hashCanonical({ a: 2 });
    expect(h1).not.toBe(h2);
  });
});
