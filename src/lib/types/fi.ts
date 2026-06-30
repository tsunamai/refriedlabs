// Shared types for the financial-independence (savings rate -> years) calculator.
// Calculators import from here. Pages import from here. No circular deps.

export interface FIInputs {
	annualSpending: number;        // what you live on per year, in today's dollars
	savingsRatePercent: number;    // 0-100, share of take-home you save
	realReturnPercent: number;     // inflation-adjusted return, default 5
	withdrawalRatePercent: number; // safe withdrawal rate, default 4 (the "4% rule")
	currentSavings: number;        // already invested today; default 0
}

export interface FIResult {
	targetNumber: number;     // annualSpending / withdrawalRate ("your number")
	annualSavings: number;    // dollars saved per year, implied by spending + rate
	yearsToFI: number | null; // null = not reachable at this savings rate
	alreadyThere: boolean;    // currentSavings already covers the target
}

export interface FITableRow {
	savingsRatePercent: number;
	yearsToFI: number | null; // null = not reachable / capped
}

// Take-home-anchored entry: the user types one number they actually know
// (their pay) and explores a savings-rate slider. Spending is derived.
export interface FITakeHomeInputs {
	takeHome: number;              // annual take-home (after-tax) pay
	savingsRatePercent: number;    // 0-100, from the slider
	realReturnPercent: number;
	withdrawalRatePercent: number;
	currentSavings: number;
}

export interface FITakeHomeResult extends FIResult {
	annualSpending: number; // derived: takeHome * (1 - savingsRate)
}
