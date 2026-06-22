// Shared types for bill, tip, and split calculations.
// Calculators import from here. Pages import from here. No circular deps.

export interface TipInputs {
	billAmount: number;
	tipPercent: number; // 0-100
	partySize: number;  // integer >= 1
}

export interface TipResult {
	tipAmount: number;
	total: number;
	perPerson: number | null;    // null when partySize === 1
	tipPerPerson: number | null; // null when partySize === 1
}

export interface LineItem {
	id: string;
	label: string;
	amount: number;
	isAlcohol: boolean;
}

export interface ItemizedInputs {
	items: LineItem[];
	taxRate: number;        // food sales tax %, e.g. 8.5
	alcoholTaxRate: number; // alcohol tax %; equals taxRate when no separate rate applies
	tipPercent: number;
	tipBase: 'pretax' | 'posttax';
}

export interface ItemizedResult {
	foodSubtotal: number;
	alcoholSubtotal: number;
	subtotal: number;
	taxAmount: number;
	tipBaseAmount: number;
	tipAmount: number;
	total: number;
}

// Person and assignment types for the split-the-check flow (Phase 3).
export interface Person {
	id: string;
	name: string;
}

export interface Assignment {
	itemId: string;
	personIds: string[]; // empty = split evenly across all people
}

export interface PersonItemLine {
	label: string;
	amount: number;
	taxAmount: number;
	tipAmount: number;
}

export interface PersonSplitResult {
	person: Person;
	items: PersonItemLine[];
	subtotal: number;
	taxAmount: number;
	tipAmount: number;
	total: number;
}
