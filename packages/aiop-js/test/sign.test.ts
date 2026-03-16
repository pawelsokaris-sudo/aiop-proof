import { describe, it, expect } from 'vitest';
import { signProof, verifySignature } from '../src/sign.js';

describe('signProof', () => {
  it('produces a base64 string', () => {
    const sig = signProof('test-hash', 'secret');
    expect(sig).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('same inputs produce same signature', () => {
    const s1 = signProof('hash123', 'key');
    const s2 = signProof('hash123', 'key');
    expect(s1).toBe(s2);
  });

  it('different secrets produce different signatures', () => {
    const s1 = signProof('hash123', 'key-a');
    const s2 = signProof('hash123', 'key-b');
    expect(s1).not.toBe(s2);
  });
});

describe('verifySignature', () => {
  it('verifies correct signature', () => {
    const sig = signProof('my-proof-hash', 'my-secret');
    expect(verifySignature('my-proof-hash', sig, 'my-secret')).toBe(true);
  });

  it('rejects wrong secret', () => {
    const sig = signProof('my-proof-hash', 'my-secret');
    expect(verifySignature('my-proof-hash', sig, 'wrong-secret')).toBe(false);
  });

  it('rejects tampered hash', () => {
    const sig = signProof('my-proof-hash', 'my-secret');
    expect(verifySignature('tampered-hash', sig, 'my-secret')).toBe(false);
  });

  it('rejects tampered signature', () => {
    expect(verifySignature('my-proof-hash', 'dGFtcGVyZWQ=', 'my-secret')).toBe(false);
  });
});
