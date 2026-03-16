/**
 * AioP v0.1 — Proof Generation and Verification
 *
 * Core functions for creating and verifying execution proofs.
 */

import { randomUUID } from 'node:crypto';
import { canonicalize } from './canonicalize.js';
import { hashCanonical } from './hash.js';
import { signProof, verifySignature } from './sign.js';
import type { ProofRecord, GenerateProofInput } from './types.js';

/**
 * Generate a signed proof record for a single execution step.
 *
 * @param input - Contract, states, action, and signing key
 * @returns A complete, signed ProofRecord
 */
export function generateProof(input: GenerateProofInput): ProofRecord {
  const {
    contract,
    preState,
    action,
    postState,
    secret,
    timestamp = new Date().toISOString(),
    proofId = randomUUID(),
  } = input;

  // 1. Hash inputs
  const contract_hash = hashCanonical(contract);
  const pre_state_hash = hashCanonical(preState);
  const post_state_hash = hashCanonical(postState);

  // 2. Build proof body (everything except signature and proof_hash)
  const proofBody = {
    version: '0.1' as const,
    proof_id: proofId,
    timestamp,
    contract_hash,
    pre_state_hash,
    action,
    post_state_hash,
    signing_alg: 'hmac-sha256' as const,
  };

  // 3. Hash the proof body
  const proof_hash = hashCanonical(proofBody);

  // 4. Sign the proof hash
  const signature = signProof(proof_hash, secret);

  return {
    ...proofBody,
    proof_hash,
    signature,
  };
}

/**
 * Verify the HMAC signature of a proof record.
 *
 * Checks that the signature matches the proof_hash using the provided secret.
 *
 * @param proof - The proof record to verify
 * @param secret - The HMAC secret key
 * @returns true if the signature is valid
 */
export function verifyProofSignature(proof: ProofRecord, secret: string): boolean {
  // 1. Recompute proof_hash from body
  const proofBody = {
    version: proof.version,
    proof_id: proof.proof_id,
    timestamp: proof.timestamp,
    contract_hash: proof.contract_hash,
    pre_state_hash: proof.pre_state_hash,
    action: proof.action,
    post_state_hash: proof.post_state_hash,
    signing_alg: proof.signing_alg,
  };

  const expectedHash = hashCanonical(proofBody);

  // 2. Verify proof_hash matches
  if (expectedHash !== proof.proof_hash) return false;

  // 3. Verify signature
  return verifySignature(proof.proof_hash, proof.signature, secret);
}

/**
 * Verify that a proof's hashes match the original inputs.
 *
 * This checks that the contract, pre-state, and post-state that the proof
 * claims to be about are actually the ones provided.
 *
 * @param proof - The proof record
 * @param contract - The original contract
 * @param preState - The original pre-execution state
 * @param postState - The original post-execution state
 * @returns true if all hashes match
 */
export function verifyProofContent(
  proof: ProofRecord,
  contract: unknown,
  preState: unknown,
  postState: unknown,
): boolean {
  const contractHash = hashCanonical(contract);
  const preStateHash = hashCanonical(preState);
  const postStateHash = hashCanonical(postState);

  return (
    contractHash === proof.contract_hash &&
    preStateHash === proof.pre_state_hash &&
    postStateHash === proof.post_state_hash
  );
}
