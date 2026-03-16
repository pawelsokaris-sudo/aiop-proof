import { describe, it, expect } from 'vitest';
import { generateProof, verifyProofSignature, verifyProofContent } from '../src/proof.js';

const contract = { id: 'invoice-reminder', version: '1.0', actions: ['send_email'] };
const preState = { task: 'pending', attempts: 0 };
const action = { type: 'send_email', payload: { template: 'reminder_v1' } };
const postState = { task: 'sent', attempts: 1 };
const secret = 'test-secret-key';

describe('generateProof', () => {
  it('returns a ProofRecord with all required fields', () => {
    const proof = generateProof({
      contract, preState, action, postState, secret,
      timestamp: '2026-03-15T12:00:00.000Z',
      proofId: 'test-001',
    });

    expect(proof.version).toBe('0.1');
    expect(proof.proof_id).toBe('test-001');
    expect(proof.timestamp).toBe('2026-03-15T12:00:00.000Z');
    expect(proof.signing_alg).toBe('hmac-sha256');
    expect(proof.contract_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(proof.pre_state_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(proof.post_state_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(proof.proof_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(proof.signature).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(proof.action).toEqual(action);
  });

  it('is deterministic with same inputs', () => {
    const opts = {
      contract, preState, action, postState, secret,
      timestamp: '2026-03-15T12:00:00.000Z',
      proofId: 'test-001',
    };
    const p1 = generateProof(opts);
    const p2 = generateProof(opts);
    expect(p1).toEqual(p2);
  });

  it('generates UUID if proofId not provided', () => {
    const proof = generateProof({ contract, preState, action, postState, secret });
    expect(proof.proof_id).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('verifyProofSignature', () => {
  it('verifies a valid proof', () => {
    const proof = generateProof({
      contract, preState, action, postState, secret,
      timestamp: '2026-03-15T12:00:00.000Z',
      proofId: 'test-001',
    });
    expect(verifyProofSignature(proof, secret)).toBe(true);
  });

  it('rejects proof with wrong secret', () => {
    const proof = generateProof({ contract, preState, action, postState, secret });
    expect(verifyProofSignature(proof, 'wrong-secret')).toBe(false);
  });

  it('rejects tampered proof_hash', () => {
    const proof = generateProof({ contract, preState, action, postState, secret });
    const tampered = { ...proof, proof_hash: 'a'.repeat(64) };
    expect(verifyProofSignature(tampered, secret)).toBe(false);
  });

  it('rejects tampered action', () => {
    const proof = generateProof({ contract, preState, action, postState, secret });
    const tampered = { ...proof, action: { type: 'delete_all' } };
    expect(verifyProofSignature(tampered, secret)).toBe(false);
  });
});

describe('verifyProofContent', () => {
  it('verifies matching content', () => {
    const proof = generateProof({ contract, preState, action, postState, secret });
    expect(verifyProofContent(proof, contract, preState, postState)).toBe(true);
  });

  it('rejects wrong contract', () => {
    const proof = generateProof({ contract, preState, action, postState, secret });
    const wrongContract = { id: 'different', version: '2.0', actions: [] };
    expect(verifyProofContent(proof, wrongContract, preState, postState)).toBe(false);
  });

  it('rejects wrong preState', () => {
    const proof = generateProof({ contract, preState, action, postState, secret });
    expect(verifyProofContent(proof, contract, { task: 'wrong' }, postState)).toBe(false);
  });

  it('rejects wrong postState', () => {
    const proof = generateProof({ contract, preState, action, postState, secret });
    expect(verifyProofContent(proof, contract, preState, { task: 'wrong' })).toBe(false);
  });
});
