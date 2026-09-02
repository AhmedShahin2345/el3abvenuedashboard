# El3ab Venue — Product Context

El3ab Venue is the professional operating workspace for venue owners, general managers, shift managers, receptionists, and view-only staff. Its primary job is not analytics; it is keeping a physical gaming venue understandable while bookings, sessions, setups, money states, and exceptions change through the day.

## Product principles

- **Now before metrics.** The first screen answers what is happening, what is next, and what needs action.
- **Time + setup is the native canvas.** A branch runway maps resources against local time without inventing physical coordinates.
- **Exception-first operations.** Incidents, venue-collected balances, group-payment gates, downtime, and service fulfillment stay connected to affected entities.
- **Trust is visible.** Platform-captured money, venue-collected accounting, deposits, pending group gates, and payouts are never visually merged.
- **Capabilities shape the product.** Server authorization is authoritative; the frontend avoids requesting views the active scope cannot access.
- **Repeated-use speed beats decorative spectacle.** Motion communicates continuity and realtime change; it does not delay frequent actions.

## Core mental model

1. **Today** — live runway, arrivals, handoffs, attention.
2. **Bookings** — high-speed temporal search, agenda/runway, persistent inspector.
3. **Operations** — incidents, downtime, add-on fulfillment, resource health.
4. **Venue** — guest-facing presence plus resources, schedule, pricing, media, add-ons, reviews.
5. **Finance** — authorized exact money/reconciliation views only.
6. **Team** — staff/invitations/branch scope/access requests only where `staff:manage` exists.
7. **Rewards** — feature-gated venue-funded offers, fulfillment, and supported rewards analytics.

The design deliberately does not create a generic “Analytics” destination because current backend route truth does not expose a general venue analytics API. Rewards analytics and finance summaries remain in their supported domains.


## Identity and access contract

- Personal email + password create the separate Firebase Workforce identity.
- Email verification is **recommended, not a CyberVenue product blocker**.
- A linked verified phone number is mandatory.
- Authenticator/TOTP is optional in product UX, while an active deployment may still require MFA for privileged routes; the client obeys that server policy rather than downgrading it.
- Owner onboarding and staff onboarding are distinct authority journeys. Owner applications require admin review; self-joining staff require the venue owner’s explicit approval; owner-issued invitations are separately accepted by their matching identity.
- Workspace access is never inferred from local onboarding completion. `/v1/workforce/me` and backend branch permissions remain authoritative.
- Multiple locations are truthful: the first branch participates in the current owner-application contract; extra signup locations are staged and created only after owner authority exists.
