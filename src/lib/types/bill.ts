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

// Tipping etiquette guide ("How to tip in the US"). Data-only; no Svelte imports.
// How strongly a tip is expected — the thing visitors actually don't know.
export type TipExpectation =
	| 'expected' // the norm; not tipping reads as rude
	| 'optional' // appreciated, but fine to skip
	| 'extraOnly' // usually nothing, unless they go out of their way
	| 'notCustomary' // you genuinely don't tip here
	| 'checkFirst'; // a charge may ALREADY be on the bill — look before you tip

export interface TipSituation {
	id: string;
	title: string;
	expectation: TipExpectation;
	amount: string; // short answer, e.g. "18–20% of the bill"
	suggestedPercent: number | null; // when %-based; null otherwise
	note: string; // plain-language context
}

export interface TipGuideCategory {
	id: string;
	title: string;
	situations: TipSituation[];
}
