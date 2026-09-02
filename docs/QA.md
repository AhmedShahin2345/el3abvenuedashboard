# QA record

## Required checks before sharing

1. `npm run verify` — dependency-free architecture/contract guard.
2. `npm run typecheck` — full TypeScript check after dependencies are installed.
3. `npm run build` — production Next.js build.
4. Test 1440px, 1280px, 768px and 390px widths.
5. Test light/dark preference, reduced motion and `dir=rtl`.
6. Test Owner, General Manager, Shift Manager, Receptionist and View-only capability shapes.
7. Test API errors for required phone, required MFA, version conflict, revoked session and unavailable capability.

This repository intentionally contains no GitHub Actions workflows so ordinary pushes do not consume GitHub-hosted Actions minutes.
