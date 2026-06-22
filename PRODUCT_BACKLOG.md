# refriedlabs — Product Backlog
Last updated: Jun 2026

refriedlabs is a personal brand for opinionated tools built out of frustration. No civic mission. No paywall. No accounts. The bar for adding a tool: "I needed this and it didn't exist in the right form."

Full experiments and seeds live here. Ship when it works.

---

## TIPPING & BILLS TRACK

The tip calculator is the foundation. This track builds out the full picture of paying for things in America — the math, the context, and the split. Tip fatigue is real (65% of US consumers are weary of tip requests as of 2025), which makes a demystifying, judgment-free suite genuinely useful.

### LIVE

**TIP-1: Tip Calculator**
Bill amount → tip % → party split → state wage context. The $2.13/hr tipped minimum, One Fair Wage states, pre-tax vs. post-tax base. Built. Shipped.

---

### SHIP ORDER

**TIP-2: Tipping Etiquette Guide [P1 — content-only, fast build]**

"Should I tip here, and how much?" — scannable, judgment-free, venue by venue.

The problem: digital tip prompts now appear everywhere, suggested amounts have crept up, and the norms are genuinely confusing. This is not a moral lecture. It is a clear reference.

| Venue | Current Norm | Notes |
|---|---|---|
| Full-service restaurant | 18–22% | 18% = adequate; 20–22% = great. Pre-tax base is historically correct. |
| Counter service / coffee | Optional $1–2 | Not required. Digital screens prompt guilt that isn't warranted. |
| Bar | $1–2/drink or 15% | For simple orders, per-drink is the norm. |
| Takeout pickup | Optional $1–2 | Effort is real; not the same as table service. |
| Food delivery (app) | $5 minimum | Driver's livelihood depends on it; platform takes a large cut. |
| Hotel housekeeping | $2–5/night, daily | Leave daily — not lump sum at checkout (different staff may clean each day). |
| Hotel valet | $2–5 on retrieval | Not on drop-off. |
| Hotel bellhop | $1–2/bag | |
| Hotel concierge | $5–15 for major requests | Small directions: discretionary. |
| Barber / hairstylist | 15–20% | 20% is the norm. |
| Spa / massage | 15–20% | Same standard as restaurants. |
| Tattoo artist | 15–20% | Industry standard; often overlooked. |
| Food truck | Discretionary $1–2 | Not expected but meaningful. |
| Rideshare (Uber/Lyft) | 15–20% | In-app prompt; driver sees it. |
| Grocery delivery | $3–5 minimum | Separate from service fee, which goes to the platform. |

**What this tool is NOT:** a moral verdict on tipping culture. It states norms and explains the labor economics behind them. The $2.13 tipped wage context lives here too — same data as TIP-1, different framing (etiquette vs. calculator).

Format: static page, no JS required. Pure content + source links. Phone-first.
Sources: DOL Fact Sheet 15, One Fair Wage, WalletHub tipping survey (2026), Bankrate tip fatigue survey (2025).

---

**BILL-1: Itemized Bill Splitter [P1 — pure math, no OCR]**

The current tip calculator splits the total evenly. This builds the real thing: named people, named items, each item assigned to whoever ordered it.

**Inputs:**
- People: add names (or "Person 1", "Person 2", etc.)
- Items: label + amount; assign to one or more people
- Alcohol toggle per item (for separate tax rate)
- Sales tax rate (food) + optional separate alcohol tax rate
- Tip % (inherits from TIP-1 UI pattern)
- Tip base: pre-tax or post-tax

**Output:**
- Each person's food subtotal, their tax share, their tip share, their total
- "Person A owes $X. Person B owes $Y." — plain language, no payment, no accounts

**Logic:** proportional tax and tip allocation based on each person's subtotal share. If Alice ordered $30 and Bob ordered $20, Alice pays 60% of tax and tip.

This replaces the itemized "my share" section in TIP-1 with a full multi-person split. TIP-1's itemized section can be retired or redirected to BILL-1 once built.

Reuses: `src/lib/calculators/tip.ts` (the `calculateItemized` function is the starting point; extend it for multi-person).

---

**BILL-2: Receipt Photo Scan [P2 — camera + Tesseract.js]**

Add a "scan receipt" path to BILL-1. User takes a photo of the receipt → client-side OCR parses line items → user reviews and corrects → items flow into BILL-1.

**Why client-side OCR (Tesseract.js) instead of an API:**
- Keeps the app fully stateless — no backend, no API key exposed
- OCR accuracy on restaurant receipts is 68–86% for item identification; user review step is mandatory, not optional
- Tesseract.js v5 runs in a Web Worker so it doesn't block the UI

**Flow:**
1. `<input type="file" accept="image/*" capture="environment">` — opens camera on mobile
2. Tesseract.js parses image in a Web Worker, shows progress indicator
3. Parsed items appear in a review table — user corrects names and amounts
4. "Use these items" → flows into BILL-1

**Constraint:** Tesseract.js adds ~3MB to the bundle. Load it lazily (dynamic import) only when the scan path is triggered.

**Fallback:** manual entry is always available. Scan is an accelerator, not a gate.

---

**TIP-3: Digital Tip Prompt Decoder [P2 — behavioral + calculation]**

"This screen is suggesting 25%. Here's what that means."

The problem: POS systems pre-select 25%+ as the "default" option, and many calculate on the post-tax total without saying so. This tool gives you the reverse view.

**Inputs:**
- The suggested tip amounts (the three numbers on the screen)
- OR: the original bill amount + one suggested tip dollar amount

**Output:**
- What percentage each amount represents
- Whether it's calculated on pre-tax or post-tax (deduced from the numbers, if possible)
- How it compares to the current norms for that venue type (user selects: restaurant, counter, delivery, etc.)

Tone: factual, not judgmental. "25% on a post-tax $48 bill is $12. The norm for full-service restaurants is 18–22%." Full stop.

---

## FASTFUEL TRACK

**FAST-1: FastFuel Web Interface [P2 — port Python CLI to SvelteKit]**

The Python CLI at `../tsunam/fastfuel/` already has the data (116 items, 10 chains) and the scoring logic (SVI formula). This builds a web front-end for it.

**Data migration:**
- `fastfuel/data/*.csv` → JSON files in `refriedlabs/src/lib/data/fastfuel/`
- `fastfuel/src/scorer.py` → `refriedlabs/src/lib/calculators/fastfuel.ts` (port the SVI formula)
- `fastfuel/src/models.py` → TypeScript interfaces in `refriedlabs/src/lib/types/fastfuel.ts`

**V1 scope:**
- Chain selector + optional budget filter
- Ranked results table: item name, SVI score, price, protein, fiber
- "I'm at [chain]" quick mode: top 5 for that chain
- No USDA API in v1 — use existing 116-item dataset only

**V2:**
- Custom item entry (score anything by entering macros + price)
- Combo optimizer (best pair of items under $X)
- USDA lookup

---

## NUTRITION BRIDGE TRACK

**NUTR-1: What Did I Eat? [P3 — depends on FAST-1]**

After splitting a restaurant bill (BILL-1), the natural next question is "what did I actually eat?" This tool provides a rough nutritional estimate for items ordered at chain restaurants, using FastFuel's SVI framework as the lens.

**Not a fitness tracker.** Not a calorie counter. Just: "here's roughly what you ate and how it scores on satiety." The output is a satiety score + macros estimate, not a medical record.

**Flow:**
1. User is in BILL-1 after splitting — sees their items
2. "What did you eat?" prompt links to NUTR-1 with items pre-populated
3. NUTR-1 matches item names against FastFuel data (fuzzy match)
4. Shows: protein, fiber, SVI score, "how this compares to other options at this chain"

**Depends on:** FAST-1 (FastFuel data must be ported to JSON first).
**Does NOT depend on:** BILL-2 (photo OCR). Manual item entry is sufficient.

Accuracy disclaimer: "Estimates only. Nutrition data sourced from chain disclosures and may not reflect your exact order."

---

## BACKLOG INTAKE (rough ideas, not groomed)

- **Split the tax** — given your state + income, show what percentage of each dollar worked goes to which tax. Companion to FastFuel's "what keeps you full for the least money."
- **Parking meter math** — given an hourly garage rate vs. a ticket fine, at what time does it become rational to risk it? Petty. Useful.
- **Resort fee decoder** — given a hotel's nightly rate + resort fee, show the actual nightly cost and what "free" amenities you'd have to use to break even.
- **Subscription creep calculator** — list your subscriptions, see the annual total, see what you'd need to cancel to recoup a specific amount.

---

## NOTES

**No validation gate.** Tools ship when they work and feel right. No Do No Harm review, no ALICE persona, no cpa-tax agent. These are personal tools, not civic instruments.

**Accessibility is good craft.** WCAG 2.1 AA is the default, not a compliance gate. Phone-first because that's where these tools get used.

**Build must pass before push.** `npm run build` exits 0 first. Always.
