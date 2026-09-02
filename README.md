# El3ab Venue Dashboard

Greenfield standalone venue-operations web product for El3ab. This repository intentionally does **not** inherit the legacy Cyber-Reservations venue frontend. It uses current backend contracts from `AhmedShahin2345/Cyber-Reservations` for product truth and is architected so the frontend can later be merged into the main platform without a visual rewrite.

## Product architecture

The product has two deliberately separate runtime modes:

- **Demo mode** (`NEXT_PUBLIC_EL3AB_VENUE_MODE=demo`) — deterministic high-density operational fixtures for design QA, role simulation, error/offline/rush/quiet states and screenshot regression. No backend mutations are sent.
- **Live mode** (`NEXT_PUBLIC_EL3AB_VENUE_MODE=live`) — Workforce Firebase authentication, backend-derived venue/branch capabilities, authoritative API reads/mutations, and authenticated SSE invalidation with canonical re-reads.

Live mode never falls back to deterministic customer, money, incident, review, resource, team or Rewards records if the backend read is absent. If a capability is not currently exposed by an authoritative endpoint, the UI says so rather than inventing it.


## Canonical account and access journey

### First-time user — Create a venue account

1. Choose **New venue** or **Staff account · join a venue**.
2. **New venue** collects owner name, venue name, first branch, optional additional branch intents, personal email, optional venue email, password, staff count, and **Gaming setup** (pre-built PS5/PC/VR/racing/Xbox/Switch/private-room/streaming suggestions plus custom entries). The first branch is submitted with the current backend application contract; extra branches are staged until owner approval, then created through the real owner branch-creation API.
3. **Staff account** collects the staff member’s name, personal email, optional venue email and password, then uses the authoritative live venue directory to choose an existing venue and branch.
4. Firebase creates the work identity. Email verification is recommended but **not required** by the CyberVenue product flow.
5. A linked Firebase **phone number is mandatory** before application/access work can continue.
6. Authenticator/TOTP enrollment is offered but **optional** in the product flow. If the active backend deployment explicitly enforces MFA, the gateway requires enrollment before privileged workspace access instead of weakening server policy.
7. Owners submit the venue application and receive the authoritative state: `PENDING_REVIEW`, `NEEDS_INFORMATION`, `APPROVED`, `REJECTED`, or `EXPIRED`. `NEEDS_INFORMATION` supports private evidence upload and explicit resume.
8. Self-joining staff send a branch-scoped access request. Only the venue owner can approve or reject those incoming requests. Owner-issued email invitations are a separate supported path and can be accepted by the matching staff identity.
9. The workspace opens only after server-derived venue access exists.

### Returning user — Sign in

1. Sign in with the Firebase personal email and password.
2. Complete Firebase MFA when requested.
3. Email verification can be refreshed but remains optional.
4. The gateway checks server truth in this order: authorized venue access → workspace; backend-required MFA/phone gate → satisfy policy; pending invitation → invitation acceptance; saved owner application → authoritative application status; pending self-join → owner-approval status; otherwise → truthful no-access choices.
5. **Forgot password?** uses neutral Firebase reset messaging and never reveals whether an address has an account.

## Implemented surfaces

- Secure Workforce sign-in, password recovery, email verification, MFA, recent re-authentication, revoked-session and disabled-identity states.
- Access-needed journey with real pending invitations, verified venue/branch directory, prior access requests, invitation acceptance and idempotent Receptionist/View-only access requests.
- Owner application submission, private opaque status-token persistence, status refresh and private evidence upload/complete flow.
- Five canonical venue roles with capability-shaped navigation and direct-route guards.
- **Branch Runway**: resource × time operational representation without fabricated floor coordinates; mobile uses a purpose-built current-state stack.
- Today, bookings/search/inspector, walk-ins, check-in, venue-collected accounting, move/cancel, incidents, resource health and downtime context.
- Marketplace profile/revisions, resources/groups, schedule, pricing, media lifecycle, add-ons, marketplace facts, promotion requests and backend onboarding/readiness.
- Finance with branch ledger truth and owner-only payout visibility.
- Team memberships, invitations/revocation, owner-only access-request decisions.
- Feature-gated Rewards offers/redemptions/fulfillment and the only currently confirmed venue analytics endpoint: Rewards analytics.
- Authenticated branch SSE: events are invalidation hints; sensitive UI changes are re-read from the canonical API.
- Light/dark themes, English/Arabic direction architecture, reduced motion, focus states and responsive large-monitor/laptop/tablet/mobile layouts.
- Development-only deterministic state gallery and static offline previews.

## Intentionally not fabricated

- No generic venue Analytics page: `analytics:read` exists in RBAC, but a general venue analytics API was not established in the current backend route surface.
- No venue refund mutation UI: `refund:initiate` exists in policy, but no authoritative venue mutation route was established during backend archaeology.
- No fake live review inbox: the venue backend currently exposes review **response** mutation authority but not a venue-side review-list read endpoint.
- No fake floor map: the backend describes resources, groups, allocations and downtime, not physical XY venue coordinates.
- No fake settings/ownership/deletion mutations where an actual route contract is absent.

## Configure live mode

Copy `.env.example` to `.env.local` and supply the real deployment values:

```bash
NEXT_PUBLIC_EL3AB_VENUE_MODE=live
NEXT_PUBLIC_EL3AB_API_BASE_URL=https://<api-host>
NEXT_PUBLIC_WORKFORCE_FIREBASE_API_KEY=...
NEXT_PUBLIC_WORKFORCE_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_WORKFORCE_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_WORKFORCE_FIREBASE_APP_ID=...
# only if the deployment uses a Firebase tenant
NEXT_PUBLIC_WORKFORCE_FIREBASE_TENANT_ID=...
```

The dashboard never stores service-account credentials or provider secrets. Firebase public client config is the only browser identity configuration.

## Run locally

```bash
npm install
npm run dev
```

Then open `/workspace/today` in demo mode or `/sign-in` in live mode.

## Verification

```bash
npm run verify
npm run typecheck
npm run build
```

`npm run verify` is dependency-free and checks critical architecture/contracts/anti-slop invariants. This repository deliberately contains no `.github/workflows`; pushing it does not create a GitHub-hosted Actions development loop.

### Offline visual QA

When package-registry access is unavailable, serve the repo root and inspect the deterministic preview:

```bash
python3 -m http.server 4173
# open http://localhost:4173/preview/
```

See `docs/QA.md`, `docs/BACKEND-CAPABILITY-MAP.md`, `DESIGN.md` and `PRODUCT.md` for the review evidence and decision record.
