/**
 * @actproof/aiop — Minimal proof-carrying execution format
 *
 * AioP v0.1 gives a verifiable proof that a specific action was executed
 * on a specific input state according to a given contract.
 *
 * @packageDocumentation
 */

// Core functions
export { canonicalize } from './canonicalize.js';
export { hashCanonical } from './hash.js';
export { signProof, verifySignature } from './sign.js';
export { generateProof, verifyProofSignature, verifyProofContent } from './proof.js';

// Types
export type { ProofRecord, GenerateProofInput } from './types.js';
