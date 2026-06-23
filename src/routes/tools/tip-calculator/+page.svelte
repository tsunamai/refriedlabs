<script lang="ts">
	import { calculateTip, calculateItemized } from '$lib/calculators/tip';
	import { calculatePersonSplit } from '$lib/calculators/split';
	import type { LineItem, Person, Assignment } from '$lib/types/bill';
	import { STATE_OPTIONS, stateName, isOneFairWage, salesTax } from '$lib/data/states';
	import { money } from '$lib/utils/format';
	import { handleRovingKeydown } from '$lib/utils/keyboard';
	import InlineCalculator from '$lib/components/InlineCalculator.svelte';

	const DOL_FACT_SHEET = 'https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa';

	const PRESETS = [15, 18, 20, 25];
	const MAX_PARTY = 50;

	// Inputs
	let billAmount = $state('');
	let tipMode = $state<'preset' | 'other'>('preset');
	let presetPercent = $state(18); // default selection per brand
	let otherPercent = $state('');
	let partySize = $state(1);
	// state field — shared input model type (Track1Inputs.state is string)
	let selectedState: string = $state('');
	let baseMode = $state<'pretax' | 'posttax'>('pretax');
	let mode = $state<'quick' | 'split'>('quick');

	// Active tip percent: from preset buttons or the "Other" numeric input.
	const tipPercent = $derived(
		tipMode === 'other' ? Math.min(Math.max(parseFloat(otherPercent) || 0, 0), 100) : presetPercent
	);

	const bill = $derived(Math.max(parseFloat(billAmount) || 0, 0));

	const result = $derived(
		calculateTip({ billAmount: bill, tipPercent, partySize })
	);

	const hasBill = $derived(bill > 0);

	const billLabel = $derived('Bill amount');

	const baseNote = $derived(
		baseMode === 'pretax'
			? 'Tipping on the pre-tax subtotal. Most card screens use the post-tax total instead.'
			: 'Tipping on the post-tax total. Some people tip on the pre-tax subtotal instead.'
	);

	// State context
	const stateChosen = $derived(selectedState !== '');
	const stateFull = $derived(stateName(selectedState));
	const oneFairWage = $derived(stateChosen && isOneFairWage(selectedState));

	function selectPreset(value: number) {
		tipMode = 'preset';
		presetPercent = value;
	}

	function chooseOther() {
		tipMode = 'other';
	}

	// Index of the currently-selected tip option (presets 0-3, "Other" = 4).
	const tipSelectedIndex = $derived(tipMode === 'other' ? PRESETS.length : PRESETS.indexOf(presetPercent));

	function applyTipIndex(index: number) {
		if (index < PRESETS.length) {
			selectPreset(PRESETS[index]);
		} else {
			chooseOther();
		}
	}

	function onTipKeydown(e: KeyboardEvent) {
		handleRovingKeydown(e, PRESETS.length + 1, tipSelectedIndex, (next) => applyTipIndex(next));
	}

	function onBaseKeydown(e: KeyboardEvent) {
		const current = baseMode === 'pretax' ? 0 : 1;
		handleRovingKeydown(e, 2, current, (next) => {
			baseMode = next === 0 ? 'pretax' : 'posttax';
		});
	}

	function decreaseParty() {
		if (partySize > 1) partySize -= 1;
	}

	function increaseParty() {
		if (partySize < MAX_PARTY) partySize += 1;
	}

	// Itemized "my share" section
	let showItemized = $state(false);
	let lineItems: LineItem[] = $state([
		{ id: crypto.randomUUID(), label: '', amount: 0, isAlcohol: false }
	]);
	let taxRateStr = $state('');
	let alcoholTaxRateStr = $state('');
	let itemizedTipBase = $state<'pretax' | 'posttax'>('pretax');

	const hasAlcohol = $derived(lineItems.some((item) => item.isAlcohol));
	const taxRate = $derived(Math.min(Math.max(parseFloat(taxRateStr) || 0, 0), 30));
	const alcoholTaxRate = $derived(
		alcoholTaxRateStr ? Math.min(Math.max(parseFloat(alcoholTaxRateStr) || 0, 0), 30) : taxRate
	);
	const itemizedResult = $derived(
		calculateItemized({ items: lineItems, taxRate, alcoholTaxRate, tipPercent, tipBase: itemizedTipBase })
	);
	const itemizedHasInput = $derived(lineItems.some((item) => item.amount > 0));

	// Auto-fill sales tax from state selection; user can override.
	$effect(() => {
		if (selectedState) {
			const rate = salesTax(selectedState);
			taxRateStr = rate > 0 ? rate.toString() : '';
		} else {
			taxRateStr = '';
		}
	});

	const taxHint = $derived(
		!stateChosen
			? 'Tax rates vary by city and county.'
			: salesTax(selectedState) === 0
				? `No state sales tax in ${stateFull}.`
				: selectedState === 'CA'
					? 'California base rate. Your city is likely higher.'
					: `${stateFull} base rate. Local taxes may apply.`
	);

	const taxLookupUrl = $derived(
		selectedState === 'CA'
			? 'https://www.cdtfa.ca.gov/taxes-and-fees/rates.aspx'
			: null
	);

	function addItem() {
		lineItems = [...lineItems, { id: crypto.randomUUID(), label: '', amount: 0, isAlcohol: false }];
	}

	function removeItem(id: string) {
		if (lineItems.length <= 1) return;
		lineItems = lineItems.filter((item) => item.id !== id);
	}

	function updateItemAmount(id: string, value: string) {
		const amt = Math.max(parseFloat(value) || 0, 0);
		const item = lineItems.find((it) => it.id === id);
		if (item) item.amount = amt;
	}

	function toggleAlcohol(id: string) {
		const item = lineItems.find((it) => it.id === id);
		if (item) item.isAlcohol = !item.isAlcohol;
	}

	function onItemizedBaseKeydown(e: KeyboardEvent) {
		const current = itemizedTipBase === 'pretax' ? 0 : 1;
		handleRovingKeydown(e, 2, current, (next) => {
			itemizedTipBase = next === 0 ? 'pretax' : 'posttax';
		});
	}

	// --- Split mode ---
	let splitPeople: Person[] = $state([]);
	let newPersonName = $state('');
	let splitItems: LineItem[] = $state([
		{ id: crypto.randomUUID(), label: '', amount: 0, isAlcohol: false }
	]);
	let splitAssignments: Assignment[] = $state([]);
	let splitTipMode = $state<'preset' | 'other'>('preset');
	let splitPresetPercent = $state(18);
	let splitOtherPercent = $state('');
	let splitSelectedState = $state('');
	let splitTaxRateStr = $state('');
	let splitAlcoholTaxRateStr = $state('');

	const splitTipPercent = $derived(
		splitTipMode === 'other'
			? Math.min(Math.max(parseFloat(splitOtherPercent) || 0, 0), 100)
			: splitPresetPercent
	);
	const splitTipSelectedIndex = $derived(
		splitTipMode === 'other' ? PRESETS.length : PRESETS.indexOf(splitPresetPercent)
	);
	const splitTaxRate = $derived(Math.min(Math.max(parseFloat(splitTaxRateStr) || 0, 0), 30));
	const splitAlcoholTaxRate = $derived(
		splitAlcoholTaxRateStr
			? Math.min(Math.max(parseFloat(splitAlcoholTaxRateStr) || 0, 0), 30)
			: splitTaxRate
	);
	const splitHasAlcohol = $derived(splitItems.some((item) => item.isAlcohol));
	const splitResults = $derived(
		calculatePersonSplit(
			splitItems, splitPeople, splitAssignments,
			splitTaxRate, splitAlcoholTaxRate, splitTipPercent, 'pretax'
		)
	);
	const splitHasResults = $derived(splitPeople.length > 0 && splitResults.some((r) => r.total > 0));
	const splitGrandTotal = $derived(splitResults.reduce((s, r) => s + r.total, 0));
	const splitTaxHint = $derived(
		!splitSelectedState
			? 'Tax rates vary by city and county.'
			: salesTax(splitSelectedState) === 0
				? `No state sales tax in ${stateName(splitSelectedState)}.`
				: splitSelectedState === 'CA'
					? 'California base rate. Your city is likely higher.'
					: `${stateName(splitSelectedState)} base rate. Local taxes may apply.`
	);
	const splitTaxLookupUrl = $derived(
		splitSelectedState === 'CA' ? 'https://www.cdtfa.ca.gov/taxes-and-fees/rates.aspx' : null
	);

	$effect(() => {
		if (splitSelectedState) {
			const rate = salesTax(splitSelectedState);
			splitTaxRateStr = rate > 0 ? rate.toString() : '';
		} else {
			splitTaxRateStr = '';
		}
	});

	function addPerson() {
		const name = newPersonName.trim();
		if (!name) return;
		splitPeople = [...splitPeople, { id: crypto.randomUUID(), name }];
		newPersonName = '';
	}

	function removePerson(id: string) {
		splitPeople = splitPeople.filter((p) => p.id !== id);
		splitAssignments = splitAssignments.map((a) => ({
			...a,
			personIds: a.personIds.filter((pid) => pid !== id)
		}));
	}

	function addSplitItem() {
		splitItems = [...splitItems, { id: crypto.randomUUID(), label: '', amount: 0, isAlcohol: false }];
	}

	function removeSplitItem(id: string) {
		if (splitItems.length <= 1) return;
		splitItems = splitItems.filter((item) => item.id !== id);
		splitAssignments = splitAssignments.filter((a) => a.itemId !== id);
	}

	function updateSplitItemAmount(id: string, value: string) {
		const amt = Math.max(parseFloat(value) || 0, 0);
		const item = splitItems.find((it) => it.id === id);
		if (item) item.amount = amt;
	}

	function toggleSplitAlcohol(id: string) {
		const item = splitItems.find((it) => it.id === id);
		if (item) item.isAlcohol = !item.isAlcohol;
	}

	function isPersonAssigned(itemId: string, personId: string): boolean {
		const assignment = splitAssignments.find((a) => a.itemId === itemId);
		if (!assignment || assignment.personIds.length === 0) return true;
		return assignment.personIds.includes(personId);
	}

	function setAssignment(itemId: string, personIds: string[]) {
		const exists = splitAssignments.some((a) => a.itemId === itemId);
		if (exists) {
			splitAssignments = splitAssignments.map((a) =>
				a.itemId === itemId ? { itemId, personIds } : a
			);
		} else {
			splitAssignments = [...splitAssignments, { itemId, personIds }];
		}
	}

	function toggleAssignment(itemId: string, personId: string) {
		const assignment = splitAssignments.find((a) => a.itemId === itemId);
		const assignedIds = assignment?.personIds ?? [];

		if (assignedIds.length === 0) {
			// Everyone currently shares — de-select this person, make rest explicit
			const others = splitPeople.filter((p) => p.id !== personId).map((p) => p.id);
			if (others.length === 0) return;
			setAssignment(itemId, others);
		} else if (assignedIds.includes(personId)) {
			const remaining = assignedIds.filter((id) => id !== personId);
			if (remaining.length === 0) return;
			setAssignment(itemId, remaining);
		} else {
			const updated = [...assignedIds, personId];
			// If everyone is now selected, reset to empty (= everyone implicitly)
			setAssignment(itemId, updated.length === splitPeople.length ? [] : updated);
		}
	}

	function onSplitTipKeydown(e: KeyboardEvent) {
		handleRovingKeydown(e, PRESETS.length + 1, splitTipSelectedIndex, (next) => {
			if (next < PRESETS.length) { splitTipMode = 'preset'; splitPresetPercent = PRESETS[next]; }
			else splitTipMode = 'other';
		});
	}
</script>

<svelte:head>
	<title>Tip Calculator | refriedlabs</title>
	<meta
		name="description"
		content="Split the bill and see the actual math. Plus what your tip means for the person serving you, depending on the state you're in."
	/>
</svelte:head>

<nav class="breadcrumb" aria-label="Breadcrumb">
	<a href="/">← refriedlabs</a>
</nav>

<h1>Tip Calculator</h1>

<div class="mode-switch" role="group" aria-label="Calculator mode">
	<button
		type="button"
		class="mode-btn"
		class:active={mode === 'quick'}
		onclick={() => (mode = 'quick')}
	>Quick tip</button>
	<button
		type="button"
		class="mode-btn"
		class:active={mode === 'split'}
		onclick={() => (mode = 'split')}
	>Split the bill</button>
</div>

<hr class="divider" />

{#if mode === 'quick'}

<form class="tip-form" onsubmit={(e) => e.preventDefault()} novalidate>
	<!-- 1. Bill amount -->
	<div class="field">
		<label for="bill">{billLabel}</label>
		<div class="input-prefix-wrap">
			<span class="input-prefix" aria-hidden="true">$</span>
			<input
				id="bill"
				type="number"
				inputmode="decimal"
				min="0"
				step="0.01"
				placeholder="0.00"
				bind:value={billAmount}
			/>
		</div>
	</div>

	<!-- 2. Tip percentage -->
	<div class="field">
		<span class="group-label" id="tip-label">Tip percentage</span>
		<div class="segmented" role="radiogroup" aria-label="Tip percentage" tabindex="-1" onkeydown={onTipKeydown}>
			{#each PRESETS as preset, i}
				<button
					type="button"
					class="btn btn-toggle"
					class:selected={tipMode === 'preset' && presetPercent === preset}
					role="radio"
					aria-checked={tipMode === 'preset' && presetPercent === preset}
					tabindex={tipSelectedIndex === i ? 0 : -1}
					onclick={() => selectPreset(preset)}
				>
					{preset}%
				</button>
			{/each}
			<button
				type="button"
				class="btn btn-toggle"
				class:selected={tipMode === 'other'}
				role="radio"
				aria-checked={tipMode === 'other'}
				tabindex={tipSelectedIndex === PRESETS.length ? 0 : -1}
				onclick={chooseOther}
			>
				Other
			</button>
		</div>

		<p class="tip-norm-hint">18–20% is standard at sit-down restaurants.</p>

		{#if tipMode === 'other'}
			<div class="other-wrap">
				<label for="other-percent" class="sr-only">Custom tip percentage</label>
				<div class="input-suffix-wrap">
					<input
						id="other-percent"
						type="number"
						inputmode="decimal"
						min="0"
						max="100"
						step="0.01"
						placeholder="0"
						bind:value={otherPercent}
					/>
					<span class="input-suffix" aria-hidden="true">%</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- 3. Party size -->
	<div class="field">
		<span class="group-label" id="party-label">Split between</span>
		<div class="stepper" role="group" aria-labelledby="party-label">
			<button
				type="button"
				class="stepper-btn"
				onclick={decreaseParty}
				disabled={partySize <= 1}
				aria-label="Decrease party size"
			>
				<span aria-hidden="true">−</span>
			</button>
			<span class="stepper-value" aria-live="polite" aria-atomic="true">
				{partySize}
				<span class="sr-only">{partySize === 1 ? 'person' : 'people'}</span>
			</span>
			<button
				type="button"
				class="stepper-btn"
				onclick={increaseParty}
				disabled={partySize >= MAX_PARTY}
				aria-label="Increase party size"
			>
				<span aria-hidden="true">+</span>
			</button>
		</div>
	</div>

	<!-- 4. State — before result so wage context informs the tip choice -->
	<div class="field">
		<label for="state">Your state</label>
		<select id="state" bind:value={selectedState}>
			<option value="">Select your state</option>
			{#each STATE_OPTIONS as opt}
				<option value={opt.code}>{opt.name}</option>
			{/each}
		</select>
	</div>

	<!-- State-aware wage note -->
	<div class="wage-slot">
		{#if stateChosen}
			<div class="signpost-box" role="note">
				{#if oneFairWage}
					<p>
						In {stateFull}, servers receive the full state minimum wage regardless of tips. A
						tip here is additional income, not a wage substitute.
					</p>
				{:else}
					<p>
						In {stateFull}, the law lets employers pay tipped workers as little as $2.13/hr,
						with tips expected to make up the rest. Here, a tip is part of the wage, not an
						extra on top of it.
					</p>
				{/if}
			</div>

			{#if !oneFairWage}
				<p class="historical-fact">
					The $2.13 federal tipped wage has been unchanged since 1991.
				</p>
			{/if}

			<p class="source-link">
				Source:
				<a href={DOL_FACT_SHEET} target="_blank" rel="noopener noreferrer">DOL Fact Sheet 15</a>
			</p>
		{/if}
	</div>

	<!-- 5. Result block -->
	{#if hasBill}
		<section class="result" aria-live="polite" aria-label="Tip result">
			<div class="result-row">
				<span class="result-label">Tip amount</span>
				<span class="result-value">{money(result.tipAmount)}</span>
			</div>
			<div class="result-row">
				<span class="result-label">Total</span>
				<span class="result-value result-total">{money(result.total)}</span>
			</div>
			{#if partySize > 1 && result.perPerson !== null}
				<div class="result-row result-per-person">
					<span class="result-label">Tip per person</span>
					<span class="result-value">{money(result.tipPerPerson!)} each</span>
				</div>
				<div class="result-row result-per-person">
					<span class="result-label">Total per person</span>
					<span class="result-value">{money(result.perPerson)} each (approximately)</span>
				</div>
			{/if}
		</section>
	{/if}

	<!-- 6. Pre-tax / post-tax toggle (advanced — collapsed by default) -->
	<details class="tip-base-details">
		<summary class="tip-base-summary">Tip base · <span class="tip-base-current">{baseMode === 'pretax' ? 'pre-tax' : 'post-tax'}</span></summary>
		<div class="field base-field">
			<div
				class="segmented segmented-two"
				role="radiogroup"
				aria-label="Tip base"
				tabindex="-1"
				onkeydown={onBaseKeydown}
			>
				<button
					type="button"
					class="btn btn-toggle"
					class:selected={baseMode === 'pretax'}
					role="radio"
					aria-checked={baseMode === 'pretax'}
					tabindex={baseMode === 'pretax' ? 0 : -1}
					onclick={() => (baseMode = 'pretax')}
				>
					Pre-tax subtotal
				</button>
				<button
					type="button"
					class="btn btn-toggle"
					class:selected={baseMode === 'posttax'}
					role="radio"
					aria-checked={baseMode === 'posttax'}
					tabindex={baseMode === 'posttax' ? 0 : -1}
					onclick={() => (baseMode = 'posttax')}
				>
					Post-tax total
				</button>
			</div>

			<p class="base-note">{baseNote}</p>

			<details class="base-details">
				<summary>How much does this change?</summary>
				<p>
					It depends on local sales tax. On a $50 meal in a high-tax city (NYC sales tax: 8.875%),
					tipping 20% post-tax sends $10.89 instead of $10.00. In states with no sales tax,
					post-tax and pre-tax tipping are identical. Etiquette guides have historically recommended
					pre-tax because the tip amount stays the same regardless of where you eat.
				</p>
			</details>
		</div>
	</details>
</form>

<InlineCalculator />

<!-- My share by items -->
<div class="itemized-wrapper">
	<button
		type="button"
		class="section-toggle"
		onclick={() => (showItemized = !showItemized)}
		aria-expanded={showItemized}
		aria-controls="itemized-section"
	>
		{showItemized ? 'Hide my-items calculator' : 'Calculate my share by items'}
	</button>

	{#if showItemized}
		<div id="itemized-section" class="itemized-section" role="region" aria-label="Calculate my share by items">
			<p class="itemized-intro">Enter what you ordered. Uses the {tipPercent}% tip chosen above.</p>

			<ul class="item-list" aria-label="Your items">
				{#each lineItems as item, i}
					<li class="item-row">
						<input
							type="text"
							class="item-label-input"
							placeholder="Item (optional)"
							bind:value={item.label}
							aria-label={`Item ${i + 1} description`}
						/>
						<div class="input-prefix-wrap item-amount-wrap">
							<span class="input-prefix" aria-hidden="true">$</span>
							<input
								type="number"
								inputmode="decimal"
								min="0"
								step="0.01"
								placeholder="0.00"
								value={item.amount === 0 ? '' : item.amount}
								aria-label={item.label ? `${item.label} amount` : `Item ${i + 1} amount`}
								oninput={(e) => updateItemAmount(item.id, (e.currentTarget as HTMLInputElement).value)}
							/>
						</div>
						<button
							type="button"
							class="alcohol-btn"
							class:active={item.isAlcohol}
							role="switch"
							aria-checked={item.isAlcohol}
							aria-label={`${item.label || `Item ${i + 1}`}: contains alcohol`}
							onclick={() => toggleAlcohol(item.id)}
						>🍺</button>
						<button
							type="button"
							class="item-remove-btn"
							onclick={() => removeItem(item.id)}
							disabled={lineItems.length <= 1}
							aria-label={`Remove ${item.label || `item ${i + 1}`}`}
						><span aria-hidden="true">×</span></button>
					</li>
				{/each}
			</ul>

			<button type="button" class="add-item-btn" onclick={addItem}>+ Add item</button>

			<div class="field itemized-field">
				<label for="tax-rate" class="group-label">Sales tax</label>
				<div class="input-suffix-wrap tax-rate-wrap">
					<input
						id="tax-rate"
						type="number"
						inputmode="decimal"
						min="0"
						max="30"
						step="0.01"
						placeholder="0.00"
						bind:value={taxRateStr}
					/>
					<span class="input-suffix" aria-hidden="true">%</span>
				</div>
				<p class="field-hint">
					{taxHint}
					{#if taxLookupUrl}
						<a href={taxLookupUrl} target="_blank" rel="noopener noreferrer">Look up your city →</a>
					{/if}
				</p>
			</div>

			{#if hasAlcohol}
				<div class="field itemized-field">
					<label for="alcohol-tax-rate" class="group-label">
						Alcohol sales tax <span class="optional-label">(if different)</span>
					</label>
					<div class="input-suffix-wrap tax-rate-wrap">
						<input
							id="alcohol-tax-rate"
							type="number"
							inputmode="decimal"
							min="0"
							max="30"
							step="0.01"
							placeholder={taxRateStr || '0.00'}
							bind:value={alcoholTaxRateStr}
						/>
						<span class="input-suffix" aria-hidden="true">%</span>
					</div>
					<p class="field-hint">
						Leave blank to use the same rate as food. Some states (e.g. Tennessee) apply a separate liquor-by-the-drink tax that appears as its own line on the bill — check your receipt.
					</p>
				</div>
			{/if}

			<div class="field itemized-field">
				<span class="group-label" id="itemized-base-label">Tip on</span>
				<div
					class="segmented segmented-two"
					role="radiogroup"
					aria-labelledby="itemized-base-label"
					tabindex="-1"
					onkeydown={onItemizedBaseKeydown}
				>
					<button
						type="button"
						class="btn btn-toggle"
						class:selected={itemizedTipBase === 'pretax'}
						role="radio"
						aria-checked={itemizedTipBase === 'pretax'}
						tabindex={itemizedTipBase === 'pretax' ? 0 : -1}
						onclick={() => (itemizedTipBase = 'pretax')}
					>
						Pre-tax subtotal
					</button>
					<button
						type="button"
						class="btn btn-toggle"
						class:selected={itemizedTipBase === 'posttax'}
						role="radio"
						aria-checked={itemizedTipBase === 'posttax'}
						tabindex={itemizedTipBase === 'posttax' ? 0 : -1}
						onclick={() => (itemizedTipBase = 'posttax')}
					>
						Post-tax total
					</button>
				</div>
			</div>

			<section class="result itemized-result" aria-live="polite" aria-label="My share">
				{#if itemizedHasInput}
					{#if itemizedResult.foodSubtotal > 0 && itemizedResult.alcoholSubtotal > 0}
						<div class="result-row">
							<span class="result-label">Food subtotal</span>
							<span class="result-value">{money(itemizedResult.foodSubtotal)}</span>
						</div>
						<div class="result-row">
							<span class="result-label">Alcohol subtotal</span>
							<span class="result-value">{money(itemizedResult.alcoholSubtotal)}</span>
						</div>
					{/if}
					<div class="result-row">
						<span class="result-label">Sales tax</span>
						<span class="result-value">{money(itemizedResult.taxAmount)}</span>
					</div>
					<div class="result-row">
						<span class="result-label">Tip ({tipPercent}%)</span>
						<span class="result-value">{money(itemizedResult.tipAmount)}</span>
					</div>
					<div class="result-row itemized-total-row">
						<span class="result-label">My total</span>
						<span class="result-value result-total">{money(itemizedResult.total)}</span>
					</div>
					<p class="itemized-disclaimer">Estimates only. Tax rates vary by city and county.</p>
				{:else}
					<p class="result-empty">Enter your items above to see your total.</p>
				{/if}
			</section>
		</div>
	{/if}
</div>

{:else}
<!-- Split the bill mode -->
<section class="split-mode">

	<!-- 1. Who's splitting? -->
	<div class="split-section">
		<span class="group-label">Who's splitting?</span>
		<div class="add-person-row">
			<input
				type="text"
				class="person-name-input"
				placeholder="First name..."
				bind:value={newPersonName}
				maxlength="20"
				onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPerson(); } }}
				aria-label="Person's name"
			/>
			<button
				type="button"
				class="add-person-btn"
				onclick={addPerson}
				disabled={!newPersonName.trim()}
			>+ Add</button>
		</div>
		{#if splitPeople.length > 0}
			<div class="people-chips" role="list" aria-label="People splitting the check">
				{#each splitPeople as person (person.id)}
					<span class="person-chip" role="listitem">
						{person.name}
						<button
							type="button"
							class="chip-remove"
							onclick={() => removePerson(person.id)}
							aria-label={`Remove ${person.name}`}
						>×</button>
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<!-- 2. Items + who had what -->
	<div class="split-section">
		<span class="group-label">Items</span>
		<ul class="item-list" aria-label="Items to split">
			{#each splitItems as item, i (item.id)}
				<li class="split-item-row">
					<div class="item-row">
						<input
							type="text"
							class="item-label-input"
							placeholder="Item (optional)"
							bind:value={item.label}
							aria-label={`Item ${i + 1} name`}
						/>
						<div class="input-prefix-wrap item-amount-wrap">
							<span class="input-prefix" aria-hidden="true">$</span>
							<input
								type="number"
								inputmode="decimal"
								min="0"
								step="0.01"
								placeholder="0.00"
								value={item.amount === 0 ? '' : item.amount}
								aria-label={item.label ? `${item.label} amount` : `Item ${i + 1} amount`}
								oninput={(e) => updateSplitItemAmount(item.id, (e.currentTarget as HTMLInputElement).value)}
							/>
						</div>
						<button
							type="button"
							class="alcohol-btn"
							class:active={item.isAlcohol}
							role="switch"
							aria-checked={item.isAlcohol}
							aria-label={`${item.label || `Item ${i + 1}`}: mark as alcohol`}
							onclick={() => toggleSplitAlcohol(item.id)}
						>🍺</button>
						<button
							type="button"
							class="item-remove-btn"
							onclick={() => removeSplitItem(item.id)}
							disabled={splitItems.length <= 1}
							aria-label={`Remove ${item.label || `item ${i + 1}`}`}
						><span aria-hidden="true">×</span></button>
					</div>
					{#if splitPeople.length > 0}
						<div class="assignment-chips" role="group" aria-label={`Who had ${item.label || `item ${i + 1}`}?`}>
							{#each splitPeople as person (person.id)}
								{@const assigned = isPersonAssigned(item.id, person.id)}
								<button
									type="button"
									class="assign-chip"
									class:assigned
									onclick={() => toggleAssignment(item.id, person.id)}
									aria-pressed={assigned}
									aria-label={`${assigned ? 'Remove' : 'Add'} ${person.name}`}
								>{person.name}</button>
							{/each}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
		<button type="button" class="add-item-btn" onclick={addSplitItem}>+ Add item</button>
	</div>

	<!-- 3. Tip percentage -->
	<div class="split-section">
		<span class="group-label" id="split-tip-label">Tip percentage</span>
		<div class="segmented" role="radiogroup" aria-labelledby="split-tip-label" tabindex="-1" onkeydown={onSplitTipKeydown}>
			{#each PRESETS as preset, i}
				<button
					type="button"
					class="btn btn-toggle"
					class:selected={splitTipMode === 'preset' && splitPresetPercent === preset}
					role="radio"
					aria-checked={splitTipMode === 'preset' && splitPresetPercent === preset}
					tabindex={splitTipSelectedIndex === i ? 0 : -1}
					onclick={() => { splitTipMode = 'preset'; splitPresetPercent = preset; }}
				>{preset}%</button>
			{/each}
			<button
				type="button"
				class="btn btn-toggle"
				class:selected={splitTipMode === 'other'}
				role="radio"
				aria-checked={splitTipMode === 'other'}
				tabindex={splitTipSelectedIndex === PRESETS.length ? 0 : -1}
				onclick={() => { splitTipMode = 'other'; }}
			>Other</button>
		</div>
		{#if splitTipMode === 'other'}
			<div class="other-wrap">
				<label for="split-other-percent" class="sr-only">Custom tip percentage</label>
				<div class="input-suffix-wrap">
					<input
						id="split-other-percent"
						type="number"
						inputmode="decimal"
						min="0"
						max="100"
						step="0.01"
						placeholder="0"
						bind:value={splitOtherPercent}
					/>
					<span class="input-suffix" aria-hidden="true">%</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- 4. State / tax -->
	<div class="split-section">
		<label for="split-state">Your state</label>
		<select id="split-state" bind:value={splitSelectedState}>
			<option value="">Select your state</option>
			{#each STATE_OPTIONS as opt}
				<option value={opt.code}>{opt.name}</option>
			{/each}
		</select>
		<p class="field-hint">
			{splitTaxHint}
			{#if splitTaxLookupUrl}
				<a href={splitTaxLookupUrl} target="_blank" rel="noopener noreferrer">Look up your city →</a>
			{/if}
		</p>
		{#if splitHasAlcohol}
			<div style="margin-top: var(--space-sm);">
				<label for="split-alcohol-tax" class="group-label">
					Alcohol tax rate <span class="optional-label">(if different)</span>
				</label>
				<div class="input-suffix-wrap tax-rate-wrap" style="margin-top: var(--space-xs);">
					<input
						id="split-alcohol-tax"
						type="number"
						inputmode="decimal"
						min="0"
						max="30"
						step="0.01"
						placeholder={splitTaxRateStr || '0.00'}
						bind:value={splitAlcoholTaxRateStr}
					/>
					<span class="input-suffix" aria-hidden="true">%</span>
				</div>
				<p class="field-hint">Leave blank to use the same rate. Some states apply a separate liquor-by-the-drink tax.</p>
			</div>
		{/if}
	</div>

	<!-- 5. Results -->
	{#if splitPeople.length > 0}
		<section class="split-results" aria-live="polite" aria-label="Split results">
			{#if splitHasResults}
				{#each splitResults as r (r.person.id)}
					<div class="split-result-row">
						<span class="split-result-name">{r.person.name}</span>
						<span class="split-result-amount">{money(r.total)}</span>
					</div>
				{/each}
				<div class="split-result-total-row">
					<span class="split-result-name">Total</span>
					<span class="split-result-amount">{money(splitGrandTotal)}</span>
				</div>
			{:else}
				<p class="result-empty">Enter items above to see each person's share.</p>
			{/if}
		</section>
	{:else}
		<p class="split-start-hint">Add people above to get started.</p>
	{/if}

</section>
{/if}

<div class="signpost-footer" role="note">
	<p>More tools at <a href="/">refriedlabs</a></p>
</div>

<style>
	.breadcrumb {
		margin-bottom: var(--space-lg);
		font-size: 0.875rem;
	}

	.breadcrumb a {
		color: var(--muted);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: var(--terracotta);
	}



	/* Dollar prefix on inputs (matches EMG-1) */
	.input-prefix-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-prefix {
		position: absolute;
		left: 1rem;
		font-size: 1.125rem;
		color: var(--muted);
		pointer-events: none;
		user-select: none;
	}

	.input-prefix-wrap input {
		padding-left: 1.875rem;
	}

	/* Percent suffix on the "Other" input */
	.input-suffix-wrap {
		position: relative;
		display: flex;
		align-items: center;
		max-width: 8rem;
	}

	.input-suffix {
		position: absolute;
		right: 1rem;
		font-size: 1.125rem;
		color: var(--muted);
		pointer-events: none;
		user-select: none;
	}

	.input-suffix-wrap input {
		padding-right: 2rem;
	}

	.tip-norm-hint {
		font-size: 0.8125rem;
		color: var(--muted);
		margin-top: var(--space-xs);
	}

	.other-wrap {
		margin-top: var(--space-sm);
	}

	.group-label {
		font-weight: 600;
		font-size: 0.9375rem;
	}

	/* Segmented button set — equal visual weight, no low-to-high emphasis */
	.segmented {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.segmented .btn-toggle {
		flex: 1;
		min-width: 64px;
		min-height: 48px;
		border: 2px solid var(--border);
		background: transparent;
		color: var(--text);
		border-radius: var(--radius);
		font-size: 0.9375rem;
		font-family: var(--font);
		font-weight: 700;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s, color 0.15s;
		padding: var(--space-sm) var(--space-sm);
	}

	.segmented .btn-toggle:hover {
		border-color: var(--terracotta);
	}

	.segmented .btn-toggle.selected {
		border-color: var(--terracotta);
		background: var(--terracotta);
		color: white;
	}

	.segmented-two .btn-toggle {
		min-width: 120px;
	}

	/* Result block */
	.result {
		background: var(--surface);
		border-radius: var(--radius);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-md);
	}

	.result-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-sm);
	}

	.result-label {
		font-size: 0.875rem;
		color: var(--muted);
	}

	.result-value {
		font-size: 1rem;
		font-weight: 700;
		color: var(--dark);
		white-space: nowrap;
	}

	.result-total {
		font-size: 1.25rem;
	}

	.result-per-person {
		padding-top: var(--space-xs);
		border-top: 1px solid var(--border);
		margin-top: var(--space-xs);
	}

	.result-per-person .result-value {
		font-weight: 600;
		color: var(--text);
	}

	.result-empty {
		font-size: 0.9375rem;
		color: var(--muted);
	}

	/* Stepper */
	.stepper {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.stepper-btn {
		min-width: 48px;
		min-height: 48px;
		border: 2px solid var(--border);
		background: transparent;
		color: var(--dark);
		border-radius: var(--radius);
		font-size: 1.5rem;
		line-height: 1;
		font-family: var(--font);
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.stepper-btn:hover:not(:disabled) {
		border-color: var(--terracotta);
	}

	.stepper-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.stepper-btn:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
	}

	.stepper-value {
		min-width: 3rem;
		text-align: center;
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--dark);
	}

	/* State selector */
	select {
		font-family: var(--font);
		font-size: 1.125rem;
		padding: 0.75rem 1rem;
		border: 2px solid var(--border);
		border-radius: var(--radius);
		background: white;
		color: var(--dark);
		width: 100%;
		min-height: 48px;
	}

	select:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
	}

	/* Wage note slot — reserve space to prevent layout shift */
	.wage-slot {
		min-height: 5.5rem;
		margin-bottom: var(--space-md);
	}

	/* Signpost box — informational, never an alert color */
	.signpost-box {
		background: var(--cream);
		border-left: 3px solid var(--olive);
		border-radius: 0 var(--radius) var(--radius) 0;
		padding: var(--space-md);
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--text);
	}

	/* Historical fact — quieter than the note, still WCAG 4.5:1 (var(--muted)) */
	.historical-fact {
		margin-top: var(--space-sm);
		font-size: 0.8125rem;
		color: var(--muted);
		line-height: 1.5;
	}

	.source-link {
		margin-top: var(--space-xs);
		font-size: 0.8125rem;
		color: var(--muted);
	}

	.source-link a {
		color: var(--terracotta);
	}

	/* Pre-tax / post-tax */
	.base-field {
		margin-bottom: 0;
	}

	.base-note {
		margin-top: var(--space-sm);
		font-size: 0.875rem;
		color: var(--muted);
		line-height: 1.55;
	}

	.base-details {
		margin-top: var(--space-sm);
	}

	.base-details summary {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--terracotta);
		cursor: pointer;
		min-height: 44px;
		display: flex;
		align-items: center;
	}

	.base-details summary:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	.base-details p {
		margin-top: var(--space-xs);
		font-size: 0.875rem;
		color: var(--muted);
		line-height: 1.6;
	}

	.signpost-footer {
		margin-top: var(--space-lg);
		padding: var(--space-md);
		background: var(--surface);
		border-radius: var(--radius);
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--muted);
	}

	/* Itemized "my share" section */
	.section-toggle {
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--muted);
		padding: 0;
		min-height: 44px;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.section-toggle::before {
		content: '▸';
		font-size: 0.75rem;
		display: inline-block;
		transition: transform 0.15s;
	}

	.section-toggle[aria-expanded="true"]::before {
		transform: rotate(90deg);
	}

	.section-toggle:hover { color: var(--terracotta); }

	.section-toggle:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	.itemized-wrapper {
		margin-top: var(--space-sm);
	}

	.itemized-section {
		margin-top: var(--space-sm);
		padding: var(--space-md);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.itemized-intro {
		font-size: 0.875rem;
		color: var(--muted);
		margin-bottom: var(--space-md);
	}

	.item-list {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.item-row {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.item-label-input {
		flex: 1 1 60px;
		min-width: 0;
	}

	.item-amount-wrap {
		flex: 0 0 100px;
		width: 100px;
	}

	.item-amount-wrap input {
		padding-left: 1.875rem;
	}

	.alcohol-btn {
		flex: 0 0 44px;
		width: 44px;
		height: 44px;
		border: 2px solid var(--border);
		border-radius: var(--radius);
		background: transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.125rem;
		line-height: 1;
		transition: border-color 0.15s, background 0.15s;
		padding: 0;
	}

	.alcohol-btn.active {
		border-color: var(--terracotta);
		background: var(--cream);
	}

	.alcohol-btn:hover {
		border-color: var(--terracotta);
	}

	.alcohol-btn:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
	}

	.item-remove-btn {
		flex: 0 0 44px;
		width: 44px;
		height: 44px;
		border: 2px solid var(--border);
		border-radius: var(--radius);
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		line-height: 1;
		transition: border-color 0.15s, color 0.15s;
		padding: 0;
	}

	.item-remove-btn:hover:not(:disabled) {
		border-color: var(--terracotta);
		color: var(--terracotta);
	}

	.item-remove-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.item-remove-btn:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
	}

	.add-item-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--terracotta);
		padding: var(--space-xs) 0;
		min-height: 44px;
		display: flex;
		align-items: center;
	}

	.add-item-btn:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.add-item-btn:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	.itemized-field {
		margin-top: var(--space-md);
	}

	.tax-rate-wrap {
		max-width: 8rem;
	}

	.optional-label {
		font-weight: 400;
		color: var(--muted);
		font-size: 0.875rem;
	}

	.itemized-result {
		margin-top: var(--space-md);
		margin-bottom: 0;
	}

	.itemized-total-row {
		padding-top: var(--space-xs);
		border-top: 1px solid var(--border);
		margin-top: var(--space-xs);
	}

	.itemized-disclaimer {
		margin-top: var(--space-sm);
		font-size: 0.8125rem;
		color: var(--muted);
		line-height: 1.5;
	}

	/* Mode switcher */
	.mode-switch {
		display: flex;
		border: 2px solid var(--border);
		border-radius: var(--radius);
		padding: 3px;
		background: var(--surface);
		margin-top: var(--space-lg);
		margin-bottom: var(--space-lg);
	}

	.mode-btn {
		flex: 1;
		min-height: 44px;
		border: none;
		background: transparent;
		color: var(--muted);
		font-family: var(--font);
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		border-radius: calc(var(--radius) - 3px);
		transition: background 0.15s, color 0.15s;
	}

	.mode-btn.active {
		background: var(--terracotta);
		color: white;
	}

	.mode-btn:hover:not(.active) {
		color: var(--terracotta);
	}

	.mode-btn:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
	}

	/* Tip base collapsible */
	.tip-base-details {
		margin-top: var(--space-sm);
	}

	.tip-base-summary {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--muted);
		cursor: pointer;
		min-height: 44px;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		list-style: none;
	}

	.tip-base-summary::-webkit-details-marker { display: none; }

	.tip-base-summary::before {
		content: '▸';
		font-size: 0.75rem;
		transition: transform 0.15s;
	}

	.tip-base-details[open] .tip-base-summary::before {
		transform: rotate(90deg);
	}

	.tip-base-summary:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	.tip-base-current {
		color: var(--terracotta);
	}

	/* Split mode */
	.split-mode {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.split-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.add-person-row {
		display: flex;
		gap: var(--space-sm);
	}

	.person-name-input {
		flex: 1;
	}

	.add-person-btn {
		flex: 0 0 auto;
		min-height: 48px;
		padding: 0 var(--space-md);
		background: none;
		border: 2px solid var(--border);
		border-radius: var(--radius);
		font-family: var(--font);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--terracotta);
		cursor: pointer;
		white-space: nowrap;
		transition: border-color 0.15s;
	}

	.add-person-btn:hover:not(:disabled) { border-color: var(--terracotta); }
	.add-person-btn:disabled { opacity: 0.4; cursor: not-allowed; }
	.add-person-btn:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
	}

	.people-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.person-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem 0.25rem 0.75rem;
		background: var(--surface);
		border: 2px solid var(--border);
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--dark);
	}

	.chip-remove {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--muted);
		font-size: 1rem;
		line-height: 1;
		padding: 0.125rem;
		border-radius: 50%;
		min-width: 20px;
		min-height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.15s;
	}

	.chip-remove:hover { color: var(--terracotta); }
	.chip-remove:focus-visible { outline: 2px solid var(--terracotta); border-radius: 50%; }

	.split-item-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding-bottom: var(--space-sm);
		border-bottom: 1px solid var(--border);
	}

	.split-item-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.assignment-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		padding-left: 2px;
	}

	.assign-chip {
		padding: 0.25rem 0.625rem;
		border: 2px solid var(--border);
		border-radius: 999px;
		background: transparent;
		color: var(--muted);
		font-family: var(--font);
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		min-height: 32px;
		transition: border-color 0.15s, background 0.15s, color 0.15s;
	}

	.assign-chip.assigned {
		border-color: var(--terracotta);
		background: var(--terracotta);
		color: white;
	}

	.assign-chip:hover:not(.assigned) {
		border-color: var(--terracotta);
		color: var(--terracotta);
	}

	.assign-chip:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
	}

	.split-results {
		background: var(--surface);
		border-radius: var(--radius);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.split-result-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-sm);
	}

	.split-result-total-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-sm);
		padding-top: var(--space-xs);
		border-top: 1px solid var(--border);
		margin-top: var(--space-xs);
	}

	.split-result-name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--dark);
	}

	.split-result-amount {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--dark);
		white-space: nowrap;
	}

	.split-result-total-row .split-result-amount {
		font-size: 1.25rem;
	}

	.split-start-hint {
		font-size: 0.9375rem;
		color: var(--muted);
		text-align: center;
		padding: var(--space-lg) 0;
	}
</style>
