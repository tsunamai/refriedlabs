// TIP-1: Static state reference data.
//
// One Fair Wage map sourced from tip-one-fair-wage-2026.json (re-verify annually
// against https://onefairwage.site/). State-name map is static reference, not a
// threshold table, so it lives here rather than in a dated JSON file.
//
// No external API calls. All lookups are client-side and static.

import fairWageData from './tip-one-fair-wage-2026.json';

export const TIP_DATA_LAST_UPDATED = fairWageData.last_updated;
export const TIP_DATA_VERIFY_AT = fairWageData.verify_at;

const ONE_FAIR_WAGE: Record<string, boolean> = fairWageData.states;

// 50 states + DC. Order is alphabetical by full name for the selector.
export const STATE_NAMES: Record<string, string> = {
	AL: 'Alabama',
	AK: 'Alaska',
	AZ: 'Arizona',
	AR: 'Arkansas',
	CA: 'California',
	CO: 'Colorado',
	CT: 'Connecticut',
	DE: 'Delaware',
	DC: 'District of Columbia',
	FL: 'Florida',
	GA: 'Georgia',
	HI: 'Hawaii',
	ID: 'Idaho',
	IL: 'Illinois',
	IN: 'Indiana',
	IA: 'Iowa',
	KS: 'Kansas',
	KY: 'Kentucky',
	LA: 'Louisiana',
	ME: 'Maine',
	MD: 'Maryland',
	MA: 'Massachusetts',
	MI: 'Michigan',
	MN: 'Minnesota',
	MS: 'Mississippi',
	MO: 'Missouri',
	MT: 'Montana',
	NE: 'Nebraska',
	NV: 'Nevada',
	NH: 'New Hampshire',
	NJ: 'New Jersey',
	NM: 'New Mexico',
	NY: 'New York',
	NC: 'North Carolina',
	ND: 'North Dakota',
	OH: 'Ohio',
	OK: 'Oklahoma',
	OR: 'Oregon',
	PA: 'Pennsylvania',
	RI: 'Rhode Island',
	SC: 'South Carolina',
	SD: 'South Dakota',
	TN: 'Tennessee',
	TX: 'Texas',
	UT: 'Utah',
	VT: 'Vermont',
	VA: 'Virginia',
	WA: 'Washington',
	WV: 'West Virginia',
	WI: 'Wisconsin',
	WY: 'Wyoming'
};

// Selector options, sorted alphabetically by full state name.
export const STATE_OPTIONS: { code: string; name: string }[] = Object.entries(STATE_NAMES)
	.map(([code, name]) => ({ code, name }))
	.sort((a, b) => a.name.localeCompare(b.name));

// Resolve a 2-letter code to its full name. Returns '' for unknown / unselected.
export function stateName(code: string): string {
	return STATE_NAMES[code] ?? '';
}

// true = One Fair Wage state (server gets full minimum wage regardless of tips).
// false = tipped-wage state (default for any state not in the map).
export function isOneFairWage(code: string): boolean {
	return ONE_FAIR_WAGE[code] === true;
}

// State-level base sales tax rates (%). 0 = no state sales tax.
// Source: Tax Foundation / state revenue depts. Verify annually.
// Local taxes are NOT included — restaurant bills often exceed these rates.
export const STATE_SALES_TAX: Record<string, number> = {
	AL: 4.0,   AK: 0.0,   AZ: 5.6,   AR: 6.5,   CA: 7.25,
	CO: 2.9,   CT: 6.35,  DE: 0.0,   DC: 6.0,   FL: 6.0,
	GA: 4.0,   HI: 4.0,   ID: 6.0,   IL: 6.25,  IN: 7.0,
	IA: 6.0,   KS: 6.5,   KY: 6.0,   LA: 4.45,  ME: 5.5,
	MD: 6.0,   MA: 6.25,  MI: 6.0,   MN: 6.875, MS: 7.0,
	MO: 4.225, MT: 0.0,   NE: 5.5,   NV: 6.85,  NH: 0.0,
	NJ: 6.625, NM: 5.0,   NY: 4.0,   NC: 4.75,  ND: 5.0,
	OH: 5.75,  OK: 4.5,   OR: 0.0,   PA: 6.0,   RI: 7.0,
	SC: 6.0,   SD: 4.5,   TN: 7.0,   TX: 6.25,  UT: 4.85,
	VT: 6.0,   VA: 5.3,   WA: 6.5,   WV: 6.0,   WI: 5.0,
	WY: 4.0
};

// Returns the state base sales tax rate as a percentage (e.g. 7.25 for CA).
export function salesTax(code: string): number {
	return STATE_SALES_TAX[code] ?? 0;
}
