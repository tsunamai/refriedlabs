// Types for the "What Am I Actually Saving?" estimator. Calculators import from
// here; pages import from here. No circular deps.

export interface SavingsEstimateInputs {
	takeHome: number;         // per-period take-home pay (the base for the rate)
	retirementPercent: number; // 401k/retirement contribution, % of take-home
	autoTransfer: number;     // per-period dollars auto-moved to savings
	other: number;            // per-period dollars of any other regular saving
}

export interface SavingsEstimate {
	retirementAmount: number;  // dollars/period implied by the retirement %
	totalSavings: number;      // retirementAmount + autoTransfer + other
	savingsRatePercent: number; // totalSavings / takeHome, as a %
	hasInput: boolean;         // takeHome > 0
}
