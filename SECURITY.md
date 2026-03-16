# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in AioP, please report it responsibly.

**Email**: contact@actproof.io

Please **do not** open a public issue for security concerns. We will acknowledge receipt within 48 hours and aim to provide a fix or mitigation plan within 7 days.

## Scope

Security issues of particular concern include:

- Canonicalization inconsistencies that lead to different hashes for identical inputs
- HMAC signature bypass or timing attacks
- Proof body tampering that passes verification
- Hash collision scenarios within the proof format

## Out of Scope

- Issues in dependencies (report to the dependency maintainer)
- Denial of service through malformed inputs (this is a library, not a server)
