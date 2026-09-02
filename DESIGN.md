# El3ab Venue — Design System

## Visual territory: Operational Runway

The signature is structural, not decorative: resource lanes intersect time, and operational exceptions appear inside the same spatial context. The interface should remain recognizable even with the logo removed.

## Palette

- Ink `#0E1116` — primary information and active session blocks.
- Cloud `#F4F5F6` / White `#FFFFFF` — long-session neutral working surfaces.
- El3ab signal `#F15432` — authored “now” line / high-salience brand action, not a generic status color.
- Blue `#315FD5` — reserved/upcoming/actionable information.
- Green `#0D805F` — confirmed/available/healthy.
- Amber `#A76D00` — pending/needs verification without implying failure.
- Red `#B7392D` — operational problem/destructive/attention.

Every status uses text/shape in addition to color.

## Density and composition

- 236px compact nav on large desktop; navigation collapses to a bottom operating rail on tablet/mobile.
- Cards are not the default primitive. The design favors continuous runway, rows, inspectors, bands, and structured sections.
- Dense rows keep visible boundaries for scanning; financial values use tabular numerals.
- Large monitors do not stretch content indefinitely (`max-width: 1760px`).

## Motion

- 140–250ms continuity for view/hover/status movement.
- No cinematic page entrances or animated backgrounds.
- Live updates should fade/slide locally without reordering the operator’s current target.
- `prefers-reduced-motion` collapses animations.

## Arabic / RTL

Direction is set at the document root. Technical references, times, money, email, and IDs retain logical reading behavior through tabular/monospace treatment. Layouts avoid relying on English-only text widths.
