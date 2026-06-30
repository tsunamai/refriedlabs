// FI calculator tests. Run with: node --test src/lib/calculators/ (Node 18+ has
// node:test built in; no framework is installed). These exercise the 4% rule
// target, the canonical savings-rate -> years table values, the unreachable and
// already-funded branches, the zero-return linear fallback, and junk inputs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	calculateFI,
	calculateFIFromTakeHome,
	savingsRateTable,
	YEARS_CAP,
	type FITableRow
} from './fi.ts';

function approx(actual: number, expected: number, tol = 0.5): void {
	assert.ok(
		Math.abs(actual - expected) <= tol,
		`expected ${actual} to be within ${tol} of ${expected}`
	);
}

const BASE = { realReturnPercent: 5, withdrawalRatePercent: 4, currentSavings: 0 };

// --- The 4% rule: target number = annual spending / withdrawal rate ----------

test('4% rule: $40k spending -> $1,000,000 target', () => {
	const r = calculateFI({ annualSpending: 40_000, savingsRatePercent: 50, ...BASE });
	assert.equal(r.targetNumber, 1_000_000);
});

test('withdrawal rate flexes the target (3% -> x33.3)', () => {
	const r = calculateFI({
		annualSpending: 30_000,
		savingsRatePercent: 50,
		realReturnPercent: 5,
		withdrawalRatePercent: 3,
		currentSavings: 0
	});
	approx(r.targetNumber, 1_000_000, 1);
});

// --- Canonical "shockingly simple math" table (5% real, 4% SWR, from zero) ----

test('50% savings rate reaches FI in ~17 years', () => {
	const r = calculateFI({ annualSpending: 50_000, savingsRatePercent: 50, ...BASE });
	approx(r.yearsToFI as number, 16.6, 0.5);
});

test('10% savings rate takes ~51 years; 75% takes ~7', () => {
	const slow = calculateFI({ annualSpending: 50_000, savingsRatePercent: 10, ...BASE });
	const fast = calculateFI({ annualSpending: 50_000, savingsRatePercent: 75, ...BASE });
	approx(slow.yearsToFI as number, 51.4, 0.6);
	approx(fast.yearsToFI as number, 7.1, 0.5);
});

test('years are independent of the dollar amount (income cancels)', () => {
	const small = calculateFI({ annualSpending: 20_000, savingsRatePercent: 40, ...BASE });
	const large = calculateFI({ annualSpending: 200_000, savingsRatePercent: 40, ...BASE });
	approx(small.yearsToFI as number, large.yearsToFI as number, 0.0001);
});

// --- Unreachable: saving nothing never gets there ----------------------------

test('0% savings rate is not reachable (yearsToFI null)', () => {
	const r = calculateFI({ annualSpending: 50_000, savingsRatePercent: 0, ...BASE });
	assert.equal(r.yearsToFI, null);
	assert.equal(r.alreadyThere, false);
});

// --- Already funded: current savings already covers the target ---------------

test('current savings >= target means alreadyThere with 0 years', () => {
	const r = calculateFI({
		annualSpending: 40_000,
		savingsRatePercent: 30,
		realReturnPercent: 5,
		withdrawalRatePercent: 4,
		currentSavings: 1_200_000 // target is 1,000,000
	});
	assert.equal(r.alreadyThere, true);
	assert.equal(r.yearsToFI, 0);
});

test('a head start shortens the timeline', () => {
	const cold = calculateFI({ annualSpending: 50_000, savingsRatePercent: 30, ...BASE });
	const warm = calculateFI({
		annualSpending: 50_000,
		savingsRatePercent: 30,
		realReturnPercent: 5,
		withdrawalRatePercent: 4,
		currentSavings: 400_000
	});
	assert.ok((warm.yearsToFI as number) < (cold.yearsToFI as number));
});

// --- Zero-return linear fallback ---------------------------------------------

test('0% real return uses the linear fill', () => {
	// target = 1,000,000; income = 40000/0.5 = 80000; saving 50% => 40000/yr.
	// (1,000,000 - 0) / 40,000 = 25 years, exactly.
	const r = calculateFI({
		annualSpending: 40_000,
		savingsRatePercent: 50,
		realReturnPercent: 0,
		withdrawalRatePercent: 4,
		currentSavings: 0
	});
	approx(r.yearsToFI as number, 25, 0.0001);
});

// --- Junk inputs collapse safely ---------------------------------------------

test('NaN / negative inputs do not produce NaN or Infinity', () => {
	const r = calculateFI({
		annualSpending: NaN,
		savingsRatePercent: -10,
		realReturnPercent: NaN,
		withdrawalRatePercent: -5,
		currentSavings: -1000
	});
	assert.ok(Number.isFinite(r.targetNumber));
	assert.ok(Number.isFinite(r.annualSavings));
	assert.ok(r.yearsToFI === null || Number.isFinite(r.yearsToFI));
});

// --- The table --------------------------------------------------------------

test('savingsRateTable returns the default 15 rows, ascending rate / descending years', () => {
	const rows = savingsRateTable();
	assert.equal(rows.length, 15);
	assert.equal(rows[0].savingsRatePercent, 10);
	assert.equal(rows[rows.length - 1].savingsRatePercent, 80);
	// Higher savings rate => fewer (or equal) years, never more.
	const years = rows.map((r: FITableRow) => r.yearsToFI).filter((y): y is number => y !== null);
	for (let i = 1; i < years.length; i++) {
		assert.ok(years[i] <= years[i - 1] + 0.001);
	}
});

test('table years never exceed the cap', () => {
	const rows = savingsRateTable();
	rows.forEach((r: FITableRow) => {
		if (r.yearsToFI !== null) assert.ok(r.yearsToFI <= YEARS_CAP);
	});
});

// --- Take-home-anchored entry ------------------------------------------------

test('take-home $60k @ 20% -> spending $48k, target $1.2M', () => {
	const r = calculateFIFromTakeHome({
		takeHome: 60_000,
		savingsRatePercent: 20,
		realReturnPercent: 5,
		withdrawalRatePercent: 4,
		currentSavings: 0
	});
	approx(r.annualSpending, 48_000, 1);
	approx(r.annualSavings, 12_000, 1); // 20% of take-home
	approx(r.targetNumber, 1_200_000, 1);
});

test('take-home entry matches the equivalent calculateFI call', () => {
	const th = calculateFIFromTakeHome({
		takeHome: 80_000,
		savingsRatePercent: 35,
		realReturnPercent: 5,
		withdrawalRatePercent: 4,
		currentSavings: 25_000
	});
	const direct = calculateFI({
		annualSpending: 80_000 * 0.65, // take-home * (1 - s)
		savingsRatePercent: 35,
		realReturnPercent: 5,
		withdrawalRatePercent: 4,
		currentSavings: 25_000
	});
	assert.equal(th.targetNumber, direct.targetNumber);
	assert.equal(th.yearsToFI, direct.yearsToFI);
});

test('take-home with 0% savings is not reachable', () => {
	const r = calculateFIFromTakeHome({
		takeHome: 50_000,
		savingsRatePercent: 0,
		realReturnPercent: 5,
		withdrawalRatePercent: 4,
		currentSavings: 0
	});
	assert.equal(r.yearsToFI, null);
});

test('take-home is independent of period as long as annualized (12x monthly)', () => {
	const monthlyAnnualized = calculateFIFromTakeHome({
		takeHome: 5_000 * 12,
		savingsRatePercent: 25,
		realReturnPercent: 5,
		withdrawalRatePercent: 4,
		currentSavings: 0
	});
	const yearly = calculateFIFromTakeHome({
		takeHome: 60_000,
		savingsRatePercent: 25,
		realReturnPercent: 5,
		withdrawalRatePercent: 4,
		currentSavings: 0
	});
	assert.equal(monthlyAnnualized.yearsToFI, yearly.yearsToFI);
	assert.equal(monthlyAnnualized.targetNumber, yearly.targetNumber);
});

test('take-home junk inputs stay finite', () => {
	const r = calculateFIFromTakeHome({
		takeHome: NaN,
		savingsRatePercent: -5,
		realReturnPercent: NaN,
		withdrawalRatePercent: -1,
		currentSavings: NaN
	});
	assert.ok(Number.isFinite(r.annualSpending));
	assert.ok(Number.isFinite(r.targetNumber));
	assert.ok(r.yearsToFI === null || Number.isFinite(r.yearsToFI));
});
