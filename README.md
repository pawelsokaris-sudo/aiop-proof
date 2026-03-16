# AioP — Proof-Carrying Execution Protocol

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Minimal open protocol draft for proof-carrying execution in agent and automation workflows.**

AioP gives a verifiable proof that a specific action was executed on a specific input state according to a given contract. It does **not** guarantee that an action was wise, legal, or beneficial — only that the described step is consistent with the contract, state, and signature.

> **AioP v0.1 is a proof of execution record integrity, not a proof of semantic correctness or external truth.**

## Why?

In a world of autonomous agents, System A should not have to trust System B on faith. AioP provides a minimal, interoperable layer for **proof-carrying execution** — any framework can generate, export, import, and verify execution proofs.

## How It Works

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Contract │    │Pre-State │    │  Action  │    │Post-State│
│  (JSON)  │    │  (JSON)  │    │  (JSON)  │    │  (JSON)  │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │              │               │
     ▼               ▼              │               ▼
  SHA-256         SHA-256           │            SHA-256
     │               │              │               │
     ▼               ▼              ▼               ▼
┌────────────────────────────────────────────────────────────┐
│                    Proof Body                              │
│  contract_hash | pre_state_hash | action | post_state_hash│
│  version | proof_id | timestamp | signing_alg              │
└────────────────────┬───────────────────────────────────────┘
                     │
                  SHA-256 → proof_hash
                     │
               HMAC-SHA256(secret)
                     │
                     ▼
              ┌─────────────┐
              │   Signed    │
              │ Proof Record│  →  .aiop.json
              └─────────────┘
```

**Verifier** receives the proof + secret → recomputes hashes → checks signature.

## Quick Start

```typescript
import { generateProof, verifyProofSignature, verifyProofContent } from '@actproof/aiop';

// 1. Define your contract, states, and action
const contract = { id: 'invoice-reminder', version: '1.0', actions: ['send_email'] };
const preState = { task: 'pending', attempts: 0 };
const action   = { type: 'send_email', payload: { template: 'reminder_v1' } };
const postState = { task: 'sent', attempts: 1 };

// 2. Generate a signed proof
const proof = generateProof({
  contract, preState, action, postState,
  secret: 'your-signing-key'
});

// 3. Verify
verifyProofSignature(proof, 'your-signing-key');  // true
verifyProofContent(proof, contract, preState, postState);  // true
```

> **Install**: Clone this repo and import from `packages/aiop-js/src`. npm package (`@actproof/aiop`) coming soon.

## Trust Model

| Role | What they do | What they need |
|---|---|---|
| **Generator** | Creates and signs a proof record | The shared secret + all input data |
| **Verifier** | Checks signature + hash integrity | The shared secret + the proof record |
| **Auditor** | Checks content against original inputs | Original contract, preState, postState + proof |

**What the verifier actually confirms:**
1. The proof body was not tampered with (proof_hash matches)
2. The signature was created by someone possessing the secret (HMAC valid)
3. *(Optionally)* The declared hashes match the original documents (content verification)

**What the verifier cannot confirm:**
- That the action was actually executed
- That the declared states reflect reality
- That the generator is trustworthy beyond possessing the secret

## When to Use

✅ **Use for:**
- Internal pipeline step verification
- Agent workflow execution records
- Signed audit trails for automated actions
- Inter-service proof exchange (microservices, workers)

❌ **Don't use for:**
- Public attestation without additional trust anchors
- Legal proof of external real-world events
- Schema enforcement or payload validation
- Replacing full PKI / certificate infrastructure

## What does it NOT guarantee?

AioP proves **integrity of the declared execution record**, not real-world truth:
- ✅ The proof body is internally consistent (hashes match, signature valid)
- ✅ Someone with the secret signed this specific record
- ✅ The declared pre-state, action, and post-state form a coherent description
- ❌ The action was actually executed in the real world
- ❌ The post-state reflects real-world side effects
- ❌ The action was correct, legal, or desirable

## Test Vector

Canonical JSON of `{"b":1,"a":2}` → sorted keys → `{"a":2,"b":1}`

```
Input:    {"b": 1, "a": 2}
Canonical: {"a":2,"b":1}
SHA-256:   7f37c7bba05dcc1a3eec439f3027724a02738cd771219543ca5f2a8e5881406c
```

See [spec/test-vectors.json](spec/test-vectors.json) for 14 full test cases.

## API

| Function | Purpose |
|---|---|
| `canonicalize(value)` | Deterministic JSON serialization |
| `hashCanonical(value)` | SHA-256 hex of canonical JSON |
| `generateProof(input)` | Create a signed proof record |
| `verifyProofSignature(proof, secret)` | Verify HMAC signature |
| `verifyProofContent(proof, contract, preState, postState)` | Verify hashes match inputs |

See [spec/aiop-v0.1.md](spec/aiop-v0.1.md) for the full protocol specification.

## Project Structure

```
aiop-proof/
├── spec/                    # Protocol specification
│   ├── aiop-v0.1.md         # Full spec document
│   └── test-vectors.json    # Canonical test cases
├── packages/aiop-js/        # TypeScript reference implementation
│   ├── src/                 # Source code (5 files, ~280 lines)
│   └── test/                # Tests (36 tests, 100% pass)
├── examples/                # Usage examples
│   └── basic-step-proof/    # Minimal generate + verify + tamper detection
├── LICENSE                  # MIT
└── README.md                # This file
```

## Limitations (v0.1)

- **Symmetric signing only** (HMAC-SHA256) — asymmetric keys planned for v0.2
- **No replay prevention** — AioP does not prevent replay by itself; systems must implement their own deduplication
- **No session management** — this is a library, not a server
- **No schema validation** — the library does not validate action payloads against contracts
- **Declared, not attested** — the proof attests the record's integrity, not that the action was actually performed in the real world
- **Single language** — TypeScript only, Python planned

## Roadmap

| Version | Scope |
|---|---|
| **v0.1** *(current)* | HMAC-SHA256, single-step proof, TypeScript, canonical JSON |
| **v0.2** | Ed25519 / ECDSA asymmetric signing, Python SDK |
| **v0.3** | Replay-handling guidance, proof chain linking, integration examples |

## License

MIT — see [LICENSE](LICENSE).

## Security

If you discover a security vulnerability in this project, please report it responsibly by emailing **contact@actproof.io**. Do not open a public issue for security concerns.

---

Part of the [ActProof](https://actproof.io) ecosystem.
