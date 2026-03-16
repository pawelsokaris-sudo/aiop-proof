/**
 * AioP v0.1 — Type Definitions
 *
 * Minimal proof-carrying execution format for agent and automation workflows.
 */

/** A signed, verifiable proof of a single execution step. */
export interface ProofRecord {
  /** Protocol version */
  version: '0.1';
  /** Unique proof identifier (UUID v4 or deterministic) */
  proof_id: string;
  /** ISO 8601 UTC timestamp */
  timestamp: string;
  /** SHA-256 hex of canonical contract JSON */
  contract_hash: string;
  /** SHA-256 hex of canonical pre-execution state */
  pre_state_hash: string;
  /** The action that was executed (canonical form) */
  action: Record<string, unknown>;
  /** SHA-256 hex of canonical post-execution state */
  post_state_hash: string;
  /** Signing algorithm identifier */
  signing_alg: 'hmac-sha256';
  /** Base64-encoded HMAC-SHA256 signature */
  signature: string;
  /** SHA-256 hex of canonical proof body (excluding signature and proof_hash) */
  proof_hash: string;
}

/** Input for generating a proof record. */
export interface GenerateProofInput {
  /** Full contract object (will be hashed) */
  contract: unknown;
  /** Pre-execution state (will be hashed) */
  preState: unknown;
  /** Action object (will be canonicalized) */
  action: Record<string, unknown>;
  /** Post-execution state (will be hashed) */
  postState: unknown;
  /** HMAC signing key */
  secret: string;
  /** Optional ISO 8601 timestamp (defaults to now) */
  timestamp?: string;
  /** Optional proof ID (defaults to crypto.randomUUID()) */
  proofId?: string;
}
