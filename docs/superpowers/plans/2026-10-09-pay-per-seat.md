# Pay-per-seat Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add verified seat bookings and live /specialoffers without changing existing branding.
**Architecture:** Postgres serializes capacity and snapshots economics; pure pricing rules drive quotes and decisions. Next routes own payment/provider calls and an idempotent work queue; existing calendar reads additive trip data.
**Tech Stack:** Next 16, React 19, Supabase Postgres, Resend HTTP API.
**Spec:** ../specs/2026-10-09-pay-per-seat.md

## Global Constraints
Target 180000 cents; minimum 6; contribution 20000; cap 10000/seat; 20% discount only after paid minimum and T-72..T-24. Vehicle capacity starts at 8. Antigua UTC-4. Existing prices untouched. Use current mock flow; defer whole-site Stripe integration.

## Review Focus
Concurrent last-seat checkout; late paid webhook after expiry; failed/duplicate external money actions; misleading public availability; unavailable providers.

### Task 1: economics and data
- [ ] Write and run failing tests for normal/dynamic pricing, cent distribution, promo eligibility/time and impossible surcharge.
- [ ] Create src/lib/perSeatPricing.ts and SQL migration for vehicle configuration, trips, seats, work queue and private conflict guard.
- [ ] Run tests and transaction-rollback database scenarios including concurrency and duplicates.

### Task 2: customer surfaces
- [ ] Add same-layout product page, grouped charter tiles, /specialoffers, live inventory API and seat booking UI.
- [ ] Extend booking calendar with additive purple inventory and links; add navigation/home promotion.
- [ ] Verify TypeScript and page/API responses without fictional bookings.

### Task 3: verified checkout and processing
- [ ] Tests for webhook authentication/money checks and output filtering.
- [ ] Existing mock checkout with server-computed prices, SQL paid confirmation/decision/outbox procedures, retry-safe provider worker and cron.
- [ ] Queue emails reliably and document missing delivery configuration.

### Task 4: integration and publication
- [ ] Inspect Pace API and implement only verified discount inventory; report any unavailable upstream fields.
- [ ] Run suite, typecheck/build, independent whole-branch review and fix material findings.
- [ ] Apply non-destructive schema migration, publish, verify deployment and public routes.
- [ ] Report provider/social connection blockers clearly.
