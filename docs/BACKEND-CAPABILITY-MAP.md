# Backend capability map

The standalone CyberVenue client is intentionally shaped by current Cyber-Reservations authority, not by a generic dashboard taxonomy.

- Workforce identity: `/v1/workforce/me`, venue directory, invitations and branch-scoped access requests.
- Owner onboarding: public application + private status token, evidence upload/resume, then branch onboarding/readiness after approval.
- Today: authoritative branch timeline + authenticated SSE invalidation. Events trigger canonical rereads.
- Bookings: list/detail, walk-in, check-in, complete, extend, no-show, move, venue-collected balance and venue-side cancel.
- Operations: branch incidents, resource health and downtime.
- Venue: listing profile/revisions, branches, resources/groups, weekly schedule/exceptions, branch-scoped pricing, media/add-ons/facts/promotions when enabled by the backend.
- Finance: branch/venue ledger summary. Payouts require `payouts:read` and are never combined with venue-collected cash.
- Team: membership/invitations under `staff:manage`; self-join access decisions are owner-only.
- Rewards: venue-funded offers/fulfillment plus the confirmed `/rewards/analytics` surface.

No generic analytics page, refund mutation, fake review inbox or physical floor map is invented here.
