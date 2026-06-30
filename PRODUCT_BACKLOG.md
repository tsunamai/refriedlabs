# refriedlabs — Product Backlog
Last updated: Jun 2026

refriedlabs is a personal brand for opinionated tools built out of frustration. No civic mission. No paywall. No accounts. The bar for adding a tool: "I needed this and it didn't exist in the right form."

Full experiments and seeds live here. Ship when it works.

---

## TIPPING & BILLS TRACK

The tip calculator is the foundation. This track builds out the full picture of paying for things in America — the math, the context, and the split. Tip fatigue is real (65% of US consumers are weary of tip requests as of 2025), which makes a demystifying, judgment-free suite genuinely useful.

### LIVE

**TIP-1: Tip Calculator — v1**
Bill amount → tip % → party split → state wage context. The $2.13/hr tipped minimum, One Fair Wage states, pre-tax vs. post-tax base, state sales tax auto-fill, itemized my-share section. Built. Shipped.

**TIP-1 REVAMP: Mode-First Architecture [IN PROGRESS]**

The calculator was built in stages and the UX accumulated complexity without a coherent user journey. A full revamp is underway, building incrementally. Each phase ships independently.

Architecture decisions made (Jun 2026):
- Calculation layer: pure TS functions in `src/lib/calculators/` — no Svelte, fully testable
- Shared types: `src/lib/types/bill.ts` — all interfaces live here, calculators import from here
- Utilities: `src/lib/utils/` — `format.ts` (money/percent), `keyboard.ts` (roving tabindex)
- Components: `src/lib/components/` — self-contained Svelte components, props in / events out
- Route pages: thin — own state, compose components, no business logic

| Phase | Description | Status |
|---|---|---|
| 1 | Foundation: extract types, utils, InlineCalculator component — no UI change | ✅ DONE |
| 2 | Mode switcher (Quick tip / Split the check) + Quick tip UX cleanup | next |
| 3 | Split the check: named people, item assignment via inline chips, per-person totals | planned |
| 4 | Surcharge support: SF mandate, credit card fee, living wage line items | planned |
| 5 | Delivery mode (BILL-4 implementation) | planned |

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

**TIP-4: City-Level Sales Tax Lookup [P3 — CA first, expand later]**

Auto-fill the sales tax rate by city, not just state. Currently TIP-1 fills the state base rate (e.g. 7.25% for CA); this goes one level deeper.

**V1 scope — California only:**
- Source: CDTFA quarterly rate table (official, public)
- Data: ~500+ CA cities/counties as JSON in `src/lib/data/sales-tax-ca.json`
- UX: city search field appears when CA is selected; type city name → auto-fill exact rate
- Fallback: manual override always available

**Later:** expand to other states with significant local tax variation (WA, TX, IL, NY).

**Depends on:** TIP-1 (already live). No other dependencies.

---

**BILL-3: Restaurant Surcharge Decoder [P2 — content + optional calculator]**

"What is this 4% on my bill?"

Cities increasingly allow or mandate surcharges that restaurants pass to diners. Most people have no idea what these mean — or that they're generally not tips.

**Covers:**
- SF Healthy San Francisco surcharge (~2–5%): employer health care mandate passed to the customer
- SF Employer Mandate / Living Wage surcharge
- Credit card surcharge (3–4%): legal in most states since 2013, surging in adoption
- "Living wage" / "kitchen equity" / "family sustaining wage" — voluntary charge some restaurants add for back-of-house staff

**Key point:** these fees generally do NOT go to the server. Tipping on top of a surcharge is still appropriate.

**Format:** content-only page first (P2, fast) — explanation by surcharge type, what it is, where it goes. Optional calculator later (P3) — enter bill + surcharge %, see the breakdown.

---

**BILL-4: Delivery App Fee Breakdown [P2 — calculator]**

"So what am I actually paying for on this DoorDash order?"

A $30 restaurant order can become $55 after fees. Almost none of the extra goes to the driver.

**Inputs:** food subtotal, delivery fee, service fee, small order fee (if any), DashPass credit (optional), tip, taxes.

**Outputs:** total cost, estimated driver take (base pay + tip), estimated platform take, and the tip as a % of food cost vs. % of total bill.

**Supports:** DoorDash, Uber Eats, Grubhub — fee structures differ; user selects platform.

**Honest about limits:** platform pay models are not fully disclosed. Estimates are based on reported driver data and platform help docs.

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

## PARKING & LOCAL RULES TRACK

The premise: local government rules vary by city in ways that cost real money when you don't know them. Parking is the anchor — the statewide default doesn't always apply, and nobody tells you that until you get a ticket.

**Origin:** Carmel-by-the-Sea enforces yellow zones 7 days a week. Most of California allows yellow zone parking on Sundays. Got a ticket. Built the thing.

---

**PARK-1: Color Zone Lookup — California [P2]**

"Can I park in the yellow zone here on Sunday?"

**The problem:** California has a statewide default for curb color rules (yellow = commercial loading, Mon–Sat 6am–6pm only; Sunday generally free). But cities can and do override this. Most people assume the state rule applies everywhere. It doesn't.

**Inputs:** city, curb color, day of week, time of day.

**Output:** yes / no / check signage — plus the actual rule for that city and a link to the source municipal code or parking page.

**Scope:** California cities first. Data sourced from municipal parking codes (public). Start with major cities + known exception cities (Carmel, Beverly Hills, Santa Monica, SF, etc.).

**Curb colors covered:** Yellow (commercial loading), Red (no stopping), White (passenger loading), Green (time-limited), Blue (accessible).

**Format:** stateless lookup, no accounts. City selector or search → color → day/time → answer.

---

**PARK-2: Local Rules Expansion [P3 — broader "rules that vary by city"]**

Expand beyond color zones to other local rules that blindside people:
- Overnight parking bans (many cities prohibit parking 2–6am)
- Street sweeping schedules by neighborhood
- Permit zone rules (when do you actually need a permit?)
- Tow-away hours

**Later:** expand beyond California to other states with significant local variation (NYC, Chicago, etc.).

---

**PARK-3: Parking Meter Math [P2 — pure calculator]**

Given an hourly garage rate and a ticket fine, at what point does it become rational to risk the ticket?

**Inputs:** hourly rate, max daily rate (if any), estimated parking duration, ticket fine for that zone.

**Output:** the break-even hour — "after X hours, the garage is cheaper than risking a ticket." Plus the expected value math if you want to get into it (probability of getting ticketed × fine vs. guaranteed garage cost).

Petty. Useful. Very refriedlabs.

---

## CONTEXT & PERCENTILE TRACK

**The pattern:** you have a number. You want to know what it means. You Google it, or you ask Claude, and you wait — and if you didn't prompt it right, you never get the age-adjusted answer, the local benchmark, or the five related facts that actually make the number make sense. These tools give you all of it instantly from one input.

**Why it beats AI for this:** no prompt engineering, no waiting, no hallucinated data. The answer is always the same shape. And it aggregates — one form, multiple outputs.

---

**CTX-1: Net Worth Percentile [P1]**

"Where do I stand?"

**Inputs:** net worth (assets minus debts), age bracket.

**Outputs (all at once):**
- Overall U.S. net worth percentile
- Percentile for your age bracket
- Median and mean net worth for your age group
- Distance to next milestone (next decile / top 10% / top 1%)
- Brief context: what drives the gap at this level (real estate, equities, etc.)

**Source:** Federal Reserve Survey of Consumer Finances (public, triennial). Most recent: 2022; 2025 expected.

**Why it beats a chatbot:** ChatGPT gives a vague answer or hallucinates the SCF numbers unless you know to cite the exact survey. This tool pins to the actual data and always shows the age breakdown unprompted.

---

**CTX-2: Salary Percentile [P1]**

"Is my salary good?"

**Inputs:** gross annual salary, state (optional), age bracket (optional).

**Outputs:**
- U.S. national percentile
- State-level percentile (if state provided)
- Median for your age bracket
- Median for your state
- Purchasing power context: same salary in a high-cost vs. low-cost state

**Source:** BLS Occupational Employment and Wage Statistics (public, annual).

---

**CTX-3: Effective Tax Rate Breakdown [P1]**

"What do I actually pay in taxes?"

**Inputs:** gross annual income, filing status, state.

**Outputs:**
- Federal effective rate (not marginal)
- State effective rate
- Combined effective rate
- Marginal federal bracket
- Take-home estimate (annual + monthly)
- One-liner on what the next $1,000 of income costs in tax

**Why it beats a chatbot:** most people think they're in the 22% bracket and pay 22%. This shows the actual blended rate. AI gets this right only if you ask perfectly.

---

**CTX-4: Retirement Readiness Check [P2]**

"Am I on track?"

**Inputs:** age, current retirement savings, annual income, planned retirement age.

**Outputs:**
- Fidelity savings benchmark for your age (1x by 30, 3x by 40, etc.)
- Where you stand vs. the benchmark
- What monthly savings rate gets you to 1x by the next milestone
- Simple 4% rule output: "at current trajectory, you'd have $X at 65, supporting $Y/year"

**Not financial advice.** A benchmark tool, not a plan.

> **Note:** The "When Can I Retire?" tool (`/tools/financial-independence`) shipped first and covers the simple 4% rule output (your number = annual spending × 25) plus a savings-rate → years table. CTX-4 remains distinct: it adds Fidelity age benchmarks and a current-trajectory projection. Build CTX-4 on top of, not duplicating, the shared FI math in `src/lib/calculators/fi.ts`.

---

**CTX-4b: "What Am I Actually Saving?" — savings-rate estimator [SHIPPED]**

Companion to "When Can I Retire?" — `/tools/what-am-i-saving`. That tool anchors on take-home pay and lets the user *guess* their savings rate with a slider, precisely because most people don't know their real save/spend split — "everything gets eaten up straight out of the bank account." This closes the gap.

**Approach shipped:** rather than estimating *spending* (which people can't recall), it asks for what they save **on purpose** — 401k % + auto-transfer + other regular saving — and reports that as a realistic floor: `total / take-home`. A "see when you could retire at N%" button hands the rate straight to the FI tool's slider via URL params (`?takehome&rate&period`). Stateless, no PII, fillable in under a minute. Math + tests: `src/lib/calculators/savings.ts` / `savings.test.ts`.

**Future (not built):** the "big-buckets subtract" and "what's left over" estimation modes were considered and set aside in favor of the lowest-effort "what you save on purpose" framing.

---

**CTX-5: "Is My Rent Too High?" [P2]**

**Inputs:** monthly gross income, monthly rent, city.

**Outputs:**
- Your rent-to-income ratio
- The 30% rule benchmark (and why it's outdated in high-cost cities)
- Median rent for a 1BR in your city (Census ACS data)
- Percentile: "you're paying more than X% of renters in [city]"

---

**CTX-6: Credit Score Context [P2]**

**Inputs:** credit score (FICO or VantageScore).

**Outputs:**
- Tier label (Poor / Fair / Good / Very Good / Exceptional) with your score's position within it
- Typical mortgage rate you'd qualify for at this score
- Typical auto loan rate
- Typical credit card APR
- Distance to next tier + what changes it (utilization, payment history weight, etc.)

---

## BACKLOG INTAKE (rough ideas, not groomed)

- **Split the tax** — given your state + income, show what percentage of each dollar worked goes to which tax. Companion to FastFuel's "what keeps you full for the least money."
- **Resort fee decoder** — given a hotel's nightly rate + resort fee, show the actual nightly cost and what "free" amenities you'd have to use to break even.
- **Subscription creep calculator** — list your subscriptions, see the annual total, see what you'd need to cancel to recoup a specific amount.
- **Leakage / "where the money really leaks" [idea]** — born from the FI tool: a 50% savings rate feels enormous and like deprivation, while a 3% card fee or a $15 subscription disappears because it's small, constant, and invisible. We flinch at the lump and shrug at the leak. The tool would make the leak as *legible* as "When Can I Retire?" makes the lump. Two angles, possibly the same tool: (1) the junk-fee economy — surcharges, card fees, service fees, resort fees, the small recurring stuff (overlaps the **Subscription creep calculator** and **Resort fee decoder** above; this is the behavioral framing that ties them together); (2) the proportion-blindness flip — people obsess over a $6 subscription while a few % on the *house or the car* (rate, term, trim level, "just $X more a month") dwarfs a lifetime of subscriptions and goes largely unexamined. The honest punchline: the energy spent policing small visible fees is often misallocated from the few big decisions that actually move the number. Keep it non-preachy — show the relative sizes, let the contrast land on its own (same register as the FI tool's "the salary cancels out").

---

## NOTES

**No validation gate.** Tools ship when they work and feel right. No Do No Harm review, no ALICE persona, no cpa-tax agent. These are personal tools, not civic instruments.

**Accessibility is good craft.** WCAG 2.1 AA is the default, not a compliance gate. Phone-first because that's where these tools get used.

**Build must pass before push.** `npm run build` exits 0 first. Always.
