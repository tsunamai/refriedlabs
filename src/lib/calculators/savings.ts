// "What Am I Actually Saving?" math. Pure functions, no side effects, no Svelte.
//
// The honest, low-effort read: most people don't know their spending, but they
// can name what they save on purpose — a 401k percentage, an auto-transfer, the
// odd standing transfer. Sum those; the rate is that total over take-home.
//
//   total = takeHome * (retirement% / 100) + autoTransfer + other
//   rate  = total / takeHome
//
// All inputs are in the SAME period (month or month, year or year); the rate is
// period-independent, so the page can feed either. The result hands a realistic
// savings rate to the "When Can I Retire?" slider.

import type { SavingsEstimateInputs, SavingsEstimate } from '$lib/types/savings';

export type { SavingsEstimateInputs, SavingsEstimate };

// Cap the reported rate just under 100% — saving "everything" is degenerate and
// usually means a data-entry slip (e.g. a yearly transfer typed into a monthly box).
export const MAX_RATE = 99;

function clampNonNeg(n: number): number {
	return Number.isFinite(n) ? Math.max(n, 0) : 0;
}

export function estimateSavings(inputs: SavingsEstimateInputs): SavingsEstimate {
	const takeHome = clampNonNeg(inputs.takeHome);
	const retirementPercent = Math.min(clampNonNeg(inputs.retirementPercent), 100);
	const autoTransfer = clampNonNeg(inputs.autoTransfer);
	const other = clampNonNeg(inputs.other);

	const retirementAmount = takeHome * (retirementPercent / 100);
	const totalSavings = retirementAmount + autoTransfer + other;
	const savingsRatePercent =
		takeHome > 0 ? Math.min((totalSavings / takeHome) * 100, MAX_RATE) : 0;

	return {
		retirementAmount,
		totalSavings,
		savingsRatePercent,
		hasInput: takeHome > 0
	};
}
