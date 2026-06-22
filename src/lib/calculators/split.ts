import type { LineItem, Person, Assignment, PersonItemLine, PersonSplitResult } from '$lib/types/bill';

function r2(n: number): number {
	return Math.round(n * 100) / 100;
}

export function calculatePersonSplit(
	items: LineItem[],
	people: Person[],
	assignments: Assignment[],
	taxRate: number,
	alcoholTaxRate: number,
	tipPercent: number,
	tipBase: 'pretax' | 'posttax'
): PersonSplitResult[] {
	if (people.length === 0) return [];

	const pct = Math.max(tipPercent, 0) / 100;
	const tr = Math.max(taxRate, 0) / 100;
	const atr = Math.max(alcoholTaxRate, 0) / 100;

	return people.map((person): PersonSplitResult => {
		const lines: PersonItemLine[] = [];
		let subtotal = 0;
		let taxAmount = 0;

		for (const item of items) {
			const amt = Number.isFinite(item.amount) ? Math.max(item.amount, 0) : 0;
			if (amt === 0) continue;

			const assignment = assignments.find((a) => a.itemId === item.id);
			const assignedIds = assignment?.personIds ?? [];
			const sharedBy =
				assignedIds.length === 0
					? people
					: people.filter((p) => assignedIds.includes(p.id));

			if (!sharedBy.some((p) => p.id === person.id)) continue;

			const share = r2(amt / sharedBy.length);
			const rate = item.isAlcohol ? atr : tr;
			const tax = r2(share * rate);

			lines.push({ label: item.label || 'Item', amount: share, taxAmount: tax, tipAmount: 0 });
			subtotal = r2(subtotal + share);
			taxAmount = r2(taxAmount + tax);
		}

		const tipBaseAmt = tipBase === 'pretax' ? subtotal : r2(subtotal + taxAmount);
		const tipAmount = r2(tipBaseAmt * pct);
		const total = r2(subtotal + taxAmount + tipAmount);

		// Back-fill tip per line proportionally to each item's share of this person's subtotal
		for (const line of lines) {
			line.tipAmount = subtotal > 0 ? r2(tipAmount * (line.amount / subtotal)) : 0;
		}

		return { person, items: lines, subtotal, taxAmount, tipAmount, total };
	});
}
