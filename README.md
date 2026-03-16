# AioP — Proof-Carrying Execution Protocol

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@actproof/aiop)](https://www.npmjs.com/package/@actproof/aiop)

**Minimal open protocol draft for proof-carrying execution in agent and automation workflows.**

AioP gives a verifiable proof that a specific action was executed on a specific input state according to a given contract. It does **not** guarantee that an action was wise, legal, or beneficial — only that the described step is consistent with the contract, state, and signature.

> **AioP v0.1 is a proof of execution record integrity, not a proof of semantic correctness or external truth.**

## Why?

In a world of autonomous agents, System A should not have to trust System B on faith. AioP provides a minimal, interoperable layer for **proof-carrying execution** — any framework can generate, export, import, and verify execution proofs.

## Quick Start

```bash
npm install @actproof/aiop
```

```typescript
import { generateProof, verifyProofSignature, verifyProofContent } from '@actproof/aiop';

// 1. Define your contract, states, and action
const contract = { id: 'invoice-reminder', version: '1.0', actions: ['send_email'] };
const preState = { task: 'pending', attempts: 0 };
const action   = { type: 'send_email', payload: { template: 'reminder_v1' } };
const postState = { task: 'sent', attempts: 1 };

// 2. Generate a signed proof
const proof = generateProof({
  contract,
  preState,
  action,
  postState,
  secret: 'your-signing-key'
});

console.log(JSON.stringify(proof, null, 2));

// 3. Verify the proof
const sigValid = verifyProofSignature(proof, 'your-signing-key');
const contentValid = verifyProofContent(proof, contract, preState, postState);

console.log('Signature valid:', sigValid);   // true
console.log('Content valid:', contentValid);  // true
```

## What is this?

A minimal proof format for a single execution step in any automated workflow.

## What does it NOT guarantee?

AioP proves **integrity of the declared execution record**, not real-world truth:
- ✅ The proof body is internally consistent (hashes match, signature valid)
- ✅ Someone with the secret signed this specific record
- ✅ The declared pre-state, action, and post-state form a coherent description
- ❌ The action was actually executed in the real world
- ❌ The post-state reflects real-world side effects
- ❌ The action was correct, legal, or desirable

## Project Structure

```
aiop-proof/
├── spec/                    # Protocol specification
│   ├── aiop-v0.1.md         # Full spec document
│   └── test-vectors.json    # Canonical test cases
├── packages/aiop-js/        # TypeScript reference implementation
│   ├── src/                 # Source code
│   └── test/                # Tests
├── examples/                # Usage examples
│   └── basic-step-proof/    # Minimal generate + verify
├── LICENSE                  # MIT
└── README.md                # This file
```

## API

| Function | Purpose |
|---|---|
| `canonicalize(value)` | Deterministic JSON serialization |
| `hashCanonical(value)` | SHA-256 hex of canonical JSON |
| `generateProof(input)` | Create a signed proof record |
| `verifyProofSignature(proof, secret)` | Verify HMAC signature |
| `verifyProofContent(proof, contract, preState, postState)` | Verify hashes match inputs |

See [spec/aiop-v0.1.md](spec/aiop-v0.1.md) for the full protocol specification.

## Limitations (v0.1)

- **Symmetric signing only** (HMAC-SHA256) — asymmetric keys planned for v0.2
- **No replay prevention** — AioP does not prevent replay by itself; systems must implement their own deduplication
- **No session management** — this is a library, not a server
- **No schema validation** — the library does not validate action payloads against contracts
- **Declared, not attested** — the proof attests the record's integrity, not that the action was actually performed in the real world
- **Single language** — TypeScript only, Python planned

## License

MIT — see [LICENSE](LICENSE).

---

Part of the [ActProof](https://actproof.io) ecosystem.
