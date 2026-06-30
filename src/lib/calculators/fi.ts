// Financial-independence math. Pure functions, no side effects, no Svelte imports.
//
// The "shockingly simple math": your savings rate alone sets how many years it
// takes to reach financial independence, because it fixes both how fast the pile
// grows AND how small the pile needs to be. Income cancels out.
//
//   target T = annualSpending / withdrawalRate           (4% rule -> x25)
//   annual savings A = s * income = s * spending / (1-s) (income implied by rate)
//   solve  P0*(1+r)^n + A*((1+r)^n - 1)/r = T  for n.
//
// See naomi_app/src/accumulation.py for the year-by-year reference implementation
// this distills (savings_rate_sweep / _target_portfolio / TARGET_MULTIPLE = 25).

import type {
	FIInputs,
	FIResult,
	FITableRow,
	FITakeHomeInputs,
	FITakeHomeResult
} from '$lib/types/fi';

export type { FIInputs, FIResult, FITableRow, FITakeHomeInputs, FITakeHomeResult };

// Past this many years we stop quoting a number — the answer is "basically never".
export const YEARS_CAP = 60;

// Savings rates shown in the reference table.
export const DEFAULT_TABLE_RATES = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];

function clampNonNeg(n: number): number {
	return Number.isFinite(n) ? Math.max(n, 0) : 0;
}

// Years to grow from `current` to `target`, saving `annual` per year at real
// return `r` (a fraction, e.g. 0.05). Returns null when it never gets there
// within YEARS_CAP (or can't, because nothing is being saved).
function solveYears(target: number, annual: number, current: number, r: number): number | null {
	if (current >= target) return 0;
	if (annual <= 0) return null; // saving nothing -> never (and current < target)

	let n: number;
	if (r <= 0) {
		// No growth: pure linear fill.
		n = (target - current) / annual;
	} else {
		// x = (1+r)^n from the closed-form geometric-series solution.
		const x = (target + annual / r) / (current + annual / r);
		if (!(x > 0)) return null;
		n = Math.log(x) / Math.log(1 + r);
	}

	if (!Number.isFinite(n) || n < 0) return null;
	if (n > YEARS_CAP) return null;
	return n;
}

export function calculateFI(inputs: FIInputs): FIResult {
	const spending = clampNonNeg(inputs.annualSpending);
	// Cap the rate just under 100% — at exactly 100% implied income is infinite.
	const s = Math.min(clampNonNeg(inputs.savingsRatePercent) / 100, 0.99);
	// Withdrawal rate floored at 0.1% so the target stays finite.
	const w = Math.max(clampNonNeg(inputs.withdrawalRatePercent), 0.1) / 100;
	const r = clampNonNeg(inputs.realReturnPercent) / 100;
	const p0 = clampNonNeg(inputs.currentSavings);

	const targetNumber = spending / w;
	const income = spending / (1 - s); // s < 1 guaranteed by the cap above
	const annualSavings = income * s; // = s * spending / (1 - s)

	const alreadyThere = targetNumber <= p0;
	const yearsToFI = alreadyThere ? 0 : solveYears(targetNumber, annualSavings, p0, r);

	return { targetNumber, annualSavings, yearsToFI, alreadyThere };
}

// Take-home-anchored entry point. People know their pay, not their savings rate
// or spending, so we take pay + a slider rate and derive everything else. We
// model "you spend whatever you don't save": spending = takeHome * (1 - s).
export function calculateFIFromTakeHome(inputs: FITakeHomeInputs): FITakeHomeResult {
	const takeHome = clampNonNeg(inputs.takeHome);
	const s = Math.min(clampNonNeg(inputs.savingsRatePercent) / 100, 0.99);
	const annualSpending = takeHome * (1 - s);

	const base = calculateFI({
		annualSpending,
		savingsRatePercent: inputs.savingsRatePercent,
		realReturnPercent: inputs.realReturnPercent,
		withdrawalRatePercent: inputs.withdrawalRatePercent,
		currentSavings: inputs.currentSavings
	});

	return { ...base, annualSpending };
}

// The income-independent savings-rate -> years table (starts from $0). Depends
// only on the return and withdrawal assumptions, not on the dollar amounts, so
// we run each rate against a unit spend.
export function savingsRateTable(opts?: {
	realReturnPercent?: number;
	withdrawalRatePercent?: number;
	rates?: number[];
}): FITableRow[] {
	const realReturnPercent = opts?.realReturnPercent ?? 5;
	const withdrawalRatePercent = opts?.withdrawalRatePercent ?? 4;
	const rates = opts?.rates ?? DEFAULT_TABLE_RATES;

	return rates.map((savingsRatePercent) => {
		const { yearsToFI } = calculateFI({
			annualSpending: 1,
			savingsRatePercent,
			realReturnPercent,
			withdrawalRatePercent,
			currentSavings: 0
		});
		return { savingsRatePercent, yearsToFI };
	});
}
