/**
 * AioP v0.1 — Basic Step Proof Example
 *
 * Demonstrates generating and verifying an execution proof
 * for a simple "send email reminder" workflow step.
 *
 * Run: npx tsx basic-proof.ts
 */

import {
  generateProof,
  verifyProofSignature,
  verifyProofContent,
} from '../../packages/aiop-js/src/index.js';

// ─── 1. Define the contract ──────────────────────────────────
// The contract describes what actions are allowed
const contract = {
  id: 'invoice-reminder',
  version: '1.0',
  actions: ['send_email'],
  description: 'Send an invoice payment reminder to the customer',
};

// ─── 2. Define states ────────────────────────────────────────
// State before the action
const preState = {
  task_id: 'task-42',
  status: 'pending',
  attempts: 0,
  customer_email: 'jan@example.com',
};

// State after the action
const postState = {
  task_id: 'task-42',
  status: 'sent',
  attempts: 1,
  customer_email: 'jan@example.com',
  sent_at: '2026-03-15T12:00:00.000Z',
};

// ─── 3. Define the action ────────────────────────────────────
const action = {
  type: 'send_email',
  payload: {
    template: 'invoice_reminder_v1',
    to: 'jan@example.com',
  },
};

// ─── 4. Generate the proof ───────────────────────────────────
const SECRET = 'my-pipeline-signing-key';

const proof = generateProof({
  contract,
  preState,
  action,
  postState,
  secret: SECRET,
});

console.log('═══ Generated Proof ═══');
console.log(JSON.stringify(proof, null, 2));

// ─── 5. Verify the proof ────────────────────────────────────
console.log('\n═══ Verification ═══');

// 5a. Verify the HMAC signature
const sigValid = verifyProofSignature(proof, SECRET);
console.log(`Signature valid: ${sigValid ? '✅' : '❌'}`);

// 5b. Verify the content hashes match original inputs
const contentValid = verifyProofContent(proof, contract, preState, postState);
console.log(`Content valid:   ${contentValid ? '✅' : '❌'}`);

// ─── 6. Tamper detection demo ────────────────────────────────
console.log('\n═══ Tamper Detection ═══');

// Try to verify with wrong secret
const wrongSecret = verifyProofSignature(proof, 'wrong-key');
console.log(`Wrong secret:    ${wrongSecret ? '✅ (BAD!)' : '❌ rejected'}`);

// Try to verify with wrong state
const wrongState = verifyProofContent(proof, contract,
  { ...preState, status: 'already_sent' }, postState);
console.log(`Wrong preState:  ${wrongState ? '✅ (BAD!)' : '❌ rejected'}`);

// Try with tampered action in proof
const tamperedProof = { ...proof, action: { type: 'delete_customer' } };
const tamperedSig = verifyProofSignature(tamperedProof, SECRET);
console.log(`Tampered action: ${tamperedSig ? '✅ (BAD!)' : '❌ rejected'}`);

console.log('\n═══ Done ═══');
console.log('Save the proof as a .aiop.json file for archival.');
