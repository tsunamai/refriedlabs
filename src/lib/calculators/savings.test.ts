// savings estimator tests. Run with: node --test src/lib/calculators/savings.test.ts

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateSavings, MAX_RATE } from './savings.ts';

function approx(actual: number, expected: number, tol = 0.01): void {
	assert.ok(
		Math.abs(actual - expected) <= tol,
		`expected ${actual} to be within ${tol} of ${expected}`
	);
}

// The canonical example from the approved design preview.
test('$4,000 take-home, 6% 401k, $200 transfer -> $440 = 11%', () => {
	const r = estimateSavings({
		takeHome: 4000,
		retirementPercent: 6,
		autoTransfer: 200,
		other: 0
	});
	approx(r.retirementAmount, 240);
	approx(r.totalSavings, 440);
	approx(r.savingsRatePercent, 11);
	assert.equal(r.hasInput, true);
});

test('all three sources sum into the total', () => {
	const r = estimateSavings({
		takeHome: 5000,
		retirementPercent: 4, // 200
		autoTransfer: 150,
		other: 50
	});
	approx(r.totalSavings, 400);
	approx(r.savingsRatePercent, 8);
});

test('no take-home -> 0% and hasInput false', () => {
	const r = estimateSavings({ takeHome: 0, retirementPercent: 6, autoTransfer: 200, other: 0 });
	assert.equal(r.savingsRatePercent, 0);
	assert.equal(r.hasInput, false);
});

test('saving more than you bring home is capped at MAX_RATE', () => {
	// e.g. a yearly transfer fat-fingered into the monthly box
	const r = estimateSavings({ takeHome: 3000, retirementPercent: 0, autoTransfer: 9000, other: 0 });
	assert.equal(r.savingsRatePercent, MAX_RATE);
});

test('zero saving -> 0% (but still hasInput when take-home present)', () => {
	const r = estimateSavings({ takeHome: 4000, retirementPercent: 0, autoTransfer: 0, other: 0 });
	assert.equal(r.totalSavings, 0);
	assert.equal(r.savingsRatePercent, 0);
	assert.equal(r.hasInput, true);
});

test('the rate is period-independent (monthly vs yearly inputs match)', () => {
	const monthly = estimateSavings({ takeHome: 4000, retirementPercent: 6, autoTransfer: 200, other: 0 });
	const yearly = estimateSavings({
		takeHome: 4000 * 12,
		retirementPercent: 6,
		autoTransfer: 200 * 12,
		other: 0
	});
	approx(monthly.savingsRatePercent, yearly.savingsRatePercent);
});

test('NaN / negative inputs stay finite and non-negative', () => {
	const r = estimateSavings({
		takeHome: NaN,
		retirementPercent: -5,
		autoTransfer: NaN,
		other: -100
	});
	assert.ok(Number.isFinite(r.totalSavings));
	assert.ok(Number.isFinite(r.savingsRatePercent));
	assert.ok(r.savingsRatePercent >= 0);
});
