# refriedlabs

Personal tools built out of frustration. No paywall. No account. No civic mission required.

---

## What refriedlabs Is

Tools Naomi built because something annoyed her. The tip calculator exists because every tipping
UX is terrible and she wanted the one she actually wanted. FastFuel exists because nobody scored
fast food by satiety. That's the bar: "I needed this and it didn't exist in the right form."

No Do No Harm gate. No ALICE user lens. No validation agents required. Ship when it works.

**Structure:** Stateless. Client-side. No login, no accounts, no PII. Static prerender on Vercel
(or wherever). Free forever.

**Brand:** refriedlabs.com — warm, opinionated, a little chaotic. Bean the French bulldog is the
mascot when the brand pass happens. Full design direction TBD.

---

## Non-Negotiables

- **Read before you write.**
- **No PII.** Stateless tools, client-side only. No user data anywhere.
- **Phone-first preferred** — not enforced as a gate, but the default.
- **Build must pass before push.** `npm run build` exits 0 first.
- **WCAG 2.1 AA is the default** — accessibility is good craft, not a compliance gate here.

---

## Stack

SvelteKit + adapter-static. Same stack as Finxiety (different project, different brand).
All routes prerendered (`export const prerender = true` in `+layout.ts`).

---

## Where to Find Things

- **Product backlog:** `PRODUCT_BACKLOG.md` — full tool roadmap with ship order across Tipping & Bills, FastFuel, and Nutrition Bridge tracks
- **Brand:** refriedlabs.com (GoDaddy, 3-year registration, Jun 2026)

---

## File Structure

```
refriedlabs/
├── CLAUDE.md              ← this file
├── src/
│   ├── app.html           ← HTML shell
│   ├── app.css            ← brand tokens (warm chili palette — full brand pass TBD)
│   ├── routes/
│   │   ├── +layout.ts     ← prerender = true
│   │   ├── +layout.svelte ← minimal shell (header + skip link)
│   │   ├── +page.svelte   ← home: tool index
│   │   └── tools/
│   │       └── tip-calculator/+page.svelte
│   └── lib/
│       ├── calculators/   ← pure TS calculation functions
│       └── data/          ← static reference data (states, wage maps, etc.)
├── static/                ← favicon etc.
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Adding a New Tool

1. Create `src/routes/tools/<tool-slug>/+page.svelte`
2. Add calculation logic to `src/lib/calculators/<tool>.ts` (pure functions, no side effects)
3. Add a card to `src/routes/+page.svelte` (the home index)
4. `npm run build` to verify

---

## Future Tools

- **FastFuel web UI** — SVI scoring for fast food, browser-based. The Python CLI is at
  `../tsunam/fastfuel/`; this would be a web front-end for the same data and scoring logic.
- More calculators as annoyances arise.
