# AioP v0.1 — Protocol Specification

**Version**: 0.1  
**Status**: Draft  
**Date**: 2026-03-15

## 1. Overview

AioP (ActProof-over-Protocol) v0.1 defines a minimal, deterministic format for proving that a specific action was executed on a specific input state according to a given contract. It targets single-step execution proofs in agent and automation workflows.

### 1.1 Design Goals

- **Minimal**: The smallest useful proof record
- **Deterministic**: Canonical proof content (hashes, signature) is deterministic given fixed inputs, timestamp, and proof_id
- **Interoperable**: Language-agnostic format, verifiable by any implementation
- **Zero-trust**: Verification requires no knowledge of the system that produced the proof

### 1.2 Non-Goals (v0.1)

- Session management or TTL
- Asymmetric cryptography (PKI)
- Action payload schema validation
- Multi-step proof chains
- Distributed consensus

### 1.3 What AioP Proves — and What It Does Not

AioP v0.1 is a **proof of execution record integrity**, not a proof of semantic correctness or external truth.

- ✅ The proof body is internally consistent (hashes match, signature valid)
- ✅ Someone with the secret signed this specific record
- ✅ The declared action, pre-state, and post-state form a coherent description
- ❌ The action was actually executed in the real world
- ❌ The post-state reflects real-world side effects
- ❌ The action was correct, legal, or desirable

**AioP proves consistency and authenticity of the declared execution record; it does not independently attest real-world side effects.**

## 2. Proof Record Format

A proof record is a JSON object with the following fields:

| Field | Type | Description |
|---|---|---|
| `version` | `"0.1"` | Protocol version |
| `proof_id` | `string` | Unique identifier (UUID v4 or deterministic) |
| `timestamp` | `string` | ISO 8601 UTC timestamp |
| `contract_hash` | `string` | SHA-256 hex of canonical contract JSON |
| `pre_state_hash` | `string` | SHA-256 hex of canonical pre-execution state |
| `action` | `object` | The action that was executed (canonical form) |
| `post_state_hash` | `string` | SHA-256 hex of canonical post-execution state |
| `signing_alg` | `"hmac-sha256"` | Signing algorithm identifier |
| `signature` | `string` | Base64-encoded HMAC-SHA256 signature |
| `proof_hash` | `string` | SHA-256 hex of canonical proof body |

### 2.1 Example Proof Record

```json
{
  "version": "0.1",
  "proof_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2026-03-15T12:00:00.000Z",
  "contract_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "pre_state_hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
  "action": {
    "payload": {
      "template": "reminder_v1"
    },
    "type": "send_email"
  },
  "post_state_hash": "7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730",
  "signing_alg": "hmac-sha256",
  "signature": "K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=",
  "proof_hash": "abc123..."
}
```

> **Note**: The `action` object keys are sorted lexicographically. This is mandatory.

## 3. Canonicalization Rules

All hashing MUST be performed over **canonical JSON**. This ensures that the same logical object always produces the same hash, regardless of the implementation language or serialization library.

### 3.1 Rules

1. **Encoding**: UTF-8
2. **Object keys**: Sorted lexicographically by Unicode code point (ascending)
3. **Whitespace**: No spaces, newlines, or tabs between tokens
4. **Numbers** (v0.1 safe range: integers up to 2^53, decimals with ≤15 significant digits):
   - No trailing zeros (e.g., `1.0` → `1`, `2.10` → `2.1`)
   - No leading zeros
   - No scientific notation (e.g., `1e5` → `100000`)
   - Integers remain integers (no decimal point)
   - Implementations SHOULD reject numbers outside the IEEE 754 safe integer range
5. **Strings**: 
   - Escape `"` as `\"`
   - Escape `\` as `\\`
   - Escape control characters (`\n`, `\r`, `\t`, `\b`, `\f`)
   - Pass-through other Unicode characters as-is (no `\uXXXX` unless control char)
6. **Booleans**: Literal `true` or `false`
7. **Null**: Literal `null`
8. **Arrays**: Preserve element order, recursively canonicalize each element
9. **Nested objects**: Recursively apply all rules

### 3.2 Examples

| Input | Canonical Output |
|---|---|
| `{"b": 1, "a": 2}` | `{"a":2,"b":1}` |
| `{"z": {"b": 1, "a": 2}, "a": 0}` | `{"a":0,"z":{"a":2,"b":1}}` |
| `{"val": 1.10}` | `{"val":1.1}` |
| `{"arr": [3, 1, 2]}` | `{"arr":[3,1,2]}` |
| `{"empty": null, "ok": true}` | `{"empty":null,"ok":true}` |

## 4. Hashing Rules

### 4.1 Algorithm

SHA-256 (as defined in FIPS 180-4).

### 4.2 What is Hashed

Each hash is computed over the **canonical JSON string** (UTF-8 bytes) of the source object:

- `contract_hash = SHA-256(canonicalize(contract))`
- `pre_state_hash = SHA-256(canonicalize(preState))`
- `post_state_hash = SHA-256(canonicalize(postState))`

### 4.3 Proof Hash

The `proof_hash` is computed over the canonical proof body **excluding** the `signature` and `proof_hash` fields themselves:

```
proof_body = {
  version, proof_id, timestamp,
  contract_hash, pre_state_hash, action, post_state_hash,
  signing_alg
}
proof_hash = SHA-256(canonicalize(proof_body))
```

### 4.4 Output Format

All hashes are represented as lowercase hexadecimal strings (64 characters for SHA-256).

## 5. Signing Rules

### 5.1 Algorithm (v0.1)

HMAC-SHA256 with a shared secret key.

> **Future**: v0.2 may add Ed25519 or ECDSA for asymmetric signing.

### 5.2 What is Signed

The signature is computed over the `proof_hash`:

```
signature = Base64(HMAC-SHA256(secret, proof_hash))
```

> **Note**: The signature authenticates the proof body, not the original contract or state documents directly. The original documents are represented only by their hashes within the proof body.

### 5.3 Signature Format

Base64-encoded string (standard Base64, not URL-safe).

## 6. Verification

A proof is valid if and only if **all** of the following hold:

### 6.1 Signature Verification

1. Recompute `proof_hash` from the proof body (excluding `signature` and `proof_hash`)
2. Verify: `proof_hash` matches the stored `proof_hash`
3. Recompute HMAC: `HMAC-SHA256(secret, proof_hash)`
4. Verify: computed HMAC matches `signature` (constant-time comparison)

### 6.2 Content Verification

Given the original `contract`, `preState`, and `postState`:

1. Verify: `SHA-256(canonicalize(contract)) == proof.contract_hash`
2. Verify: `SHA-256(canonicalize(preState)) == proof.pre_state_hash`
3. Verify: `SHA-256(canonicalize(postState)) == proof.post_state_hash`

## 7. Security Considerations

- **Shared secret**: v0.1 uses symmetric HMAC. Both proof generator and verifier must possess the secret. This is suitable for internal pipelines but not for public verification.
- **Replay protection**: AioP does not provide replay prevention by itself. Systems MAY use `proof_id` and `timestamp` as replay-handling inputs, but must implement their own deduplication mechanism (e.g., a proof registry).
- **Constant-time comparison**: Signature verification MUST use constant-time comparison to prevent timing attacks.
- **Secret rotation**: Systems SHOULD support secret rotation without invalidating previously generated proofs.
- **Trust boundary**: AioP proves that a record was signed by someone possessing the secret. It does not prove that the described action was actually performed or that the declared states reflect reality. Systems requiring real-world attestation must combine AioP with external oracles or observation layers.

## 8. MIME Type and File Extension

- MIME type: `application/vnd.aiop.proof+json`
- File extension: `.aiop.json`
