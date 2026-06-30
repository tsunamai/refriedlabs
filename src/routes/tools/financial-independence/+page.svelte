<script lang="ts">
	import { calculateFIFromTakeHome, savingsRateTable, DEFAULT_TABLE_RATES } from '$lib/calculators/fi';

	// --- Inputs ---
	// Take-home is the one number people actually know. The savings slider is a
	// dial they explore, not a figure they look up. Spending is derived.
	let takeHomeStr = $state('');
	let savingsRate = $state(20); // slider value (a number — never call string methods on it)
	let period = $state<'month' | 'year'>('month');

	// Advanced assumptions — sensible defaults, tweakable.
	let returnStr = $state('5');
	let withdrawalStr = $state('4');
	let currentSavingsStr = $state('');

	const takeHomeInput = $derived(Math.max(parseFloat(takeHomeStr) || 0, 0));
	const annualTakeHome = $derived(period === 'month' ? takeHomeInput * 12 : takeHomeInput);
	const realReturn = $derived(Math.max(parseFloat(returnStr) || 0, 0));
	const withdrawal = $derived(Math.max(parseFloat(withdrawalStr) || 0, 0));
	const currentSavings = $derived(Math.max(parseFloat(currentSavingsStr) || 0, 0));

	const result = $derived(
		calculateFIFromTakeHome({
			takeHome: annualTakeHome,
			savingsRatePercent: savingsRate,
			realReturnPercent: realReturn,
			withdrawalRatePercent: withdrawal,
			currentSavings
		})
	);

	const table = $derived(
		savingsRateTable({ realReturnPercent: realReturn, withdrawalRatePercent: withdrawal })
	);

	const hasInput = $derived(annualTakeHome > 0);

	const periodLabel = $derived(period === 'month' ? 'mo' : 'yr');
	const perPeriodDivisor = $derived(period === 'month' ? 12 : 1);
	const savedPerPeriod = $derived(result.annualSavings / perPeriodDivisor);
	const spendPerPeriod = $derived(result.annualSpending / perPeriodDivisor);

	// The table row closest to where the slider sits (numeric compare — no strings).
	const highlightRate = $derived(
		DEFAULT_TABLE_RATES.reduce(
			(best, r) => (Math.abs(r - savingsRate) < Math.abs(best - savingsRate) ? r : best),
			DEFAULT_TABLE_RATES[0]
		)
	);

	const yearsDisplay = $derived.by(() => {
		if (result.alreadyThere) return "You're already there";
		if (result.yearsToFI === null) return 'Not yet — save more';
		const y = Math.round(result.yearsToFI);
		return `~${y} ${y === 1 ? 'year' : 'years'}`;
	});

	const readout = $derived.by(() => {
		if (!hasInput) return null;
		if (result.alreadyThere) {
			return `With ${dollars(currentSavings)} already invested, you're at or past your number. By this math, you're there.`;
		}
		if (result.yearsToFI === null) {
			return `At ${savingsRate}% you don't get there within a working lifetime. Drag the slider up and watch the years fall.`;
		}
		const yrs = Math.round(result.yearsToFI);
		return `Save ${dollars(savedPerPeriod)}/${periodLabel} — that's ${savingsRate}% of your pay — and you'd reach financial independence in about ${yrs} ${yrs === 1 ? 'year' : 'years'}.`;
	});

	function dollars(n: number): string {
		return `$${Math.round(n).toLocaleString('en-US')}`;
	}

	function yearsCell(years: number | null): string {
		if (years === null) return '60+';
		return `${Math.round(years)}`;
	}
</script>

<svelte:head>
	<title>When Can I Retire? | refriedlabs</title>
	<meta
		name="description"
		content="Type in your take-home pay, drag a slider for how much you'd save, and watch the years to financial independence — plus the number you'd need — update live."
	/>
</svelte:head>

<nav class="breadcrumb" aria-label="Breadcrumb">
	<a href="/">← refriedlabs</a>
</nav>

<h1>When Can I Retire?</h1>

<p class="intro">
	You don't need to track your spending to get a feel for this. Tell it what you take home, then
	drag the slider to play with how much you'd save. Saving more does two things at once: it grows
	the pile faster <em>and</em> shrinks the pile you need.
</p>

<hr class="divider" />

<form class="fi-form" onsubmit={(e) => e.preventDefault()} novalidate>
	<!-- Period toggle -->
	<div class="field">
		<span class="group-label" id="period-label">Show amounts per</span>
		<div class="segmented segmented-two" role="radiogroup" aria-labelledby="period-label">
			<button
				type="button"
				class="btn-toggle"
				class:selected={period === 'month'}
				role="radio"
				aria-checked={period === 'month'}
				onclick={() => (period = 'month')}
			>
				Month
			</button>
			<button
				type="button"
				class="btn-toggle"
				class:selected={period === 'year'}
				role="radio"
				aria-checked={period === 'year'}
				onclick={() => (period = 'year')}
			>
				Year
			</button>
		</div>
	</div>

	<!-- Take-home pay -->
	<div class="field">
		<label for="takehome">What you take home, per {period}</label>
		<div class="input-prefix-wrap">
			<span class="input-prefix" aria-hidden="true">$</span>
			<input
				id="takehome"
				type="number"
				inputmode="decimal"
				min="0"
				step={period === 'month' ? '100' : '1000'}
				placeholder={period === 'month' ? '4,000' : '50,000'}
				bind:value={takeHomeStr}
			/>
		</div>
		<p class="field-hint">Your actual pay after taxes — what lands in your account.</p>
	</div>

	<!-- Savings slider -->
	<div class="field">
		<div class="slider-head">
			<label for="rate">How much could you save?</label>
			<span class="slider-pct">{savingsRate}%</span>
		</div>
		<input
			id="rate"
			type="range"
			min="0"
			max="70"
			step="1"
			bind:value={savingsRate}
			class="slider"
			aria-describedby="slider-readout"
		/>
		<p id="slider-readout" class="slider-readout">
			{#if hasInput}
				<strong>{dollars(savedPerPeriod)}/{periodLabel}</strong> saved ·
				{dollars(spendPerPeriod)}/{periodLabel} to live on
			{:else}
				Enter your pay above to see this in real dollars.
			{/if}
		</p>
	</div>

	<!-- Result -->
	{#if hasInput}
		<section class="result" aria-live="polite" aria-label="Your result">
			<div class="hero-grid">
				<div class="hero-cell">
					<div class="hero-label">The number you'd need</div>
					<div class="hero-value">{dollars(result.targetNumber)}</div>
				</div>
				<div class="hero-cell">
					<div class="hero-label">Years to get there</div>
					<div class="hero-value">{yearsDisplay}</div>
				</div>
			</div>
			{#if readout}
				<p class="readout">{readout}</p>
			{/if}
		</section>
	{:else}
		<p class="result-empty">Enter your take-home pay to see your number and timeline.</p>
	{/if}

	<!-- Adjust assumptions (advanced — collapsed) -->
	<details class="assumptions-details">
		<summary class="assumptions-summary">
			Adjust assumptions ·
			<span class="assumptions-current">
				{realReturn}% return, {withdrawal}% withdrawal{currentSavings > 0
					? `, ${dollars(currentSavings)} saved`
					: ''}
			</span>
		</summary>
		<div class="assumptions-body">
			<div class="field">
				<label for="ret">Real return (after inflation)</label>
				<div class="input-suffix-wrap">
					<input
						id="ret"
						type="number"
						inputmode="decimal"
						min="0"
						max="20"
						step="0.5"
						placeholder="5"
						bind:value={returnStr}
					/>
					<span class="input-suffix" aria-hidden="true">%</span>
				</div>
				<p class="field-hint">A diversified portfolio has historically returned ~5% after inflation.</p>
			</div>

			<div class="field">
				<label for="wd">Withdrawal rate</label>
				<div class="input-suffix-wrap">
					<input
						id="wd"
						type="number"
						inputmode="decimal"
						min="0.1"
						max="10"
						step="0.5"
						placeholder="4"
						bind:value={withdrawalStr}
					/>
					<span class="input-suffix" aria-hidden="true">%</span>
				</div>
				<p class="field-hint">The classic "4% rule." Lower is more cautious (3% = a bigger number).</p>
			</div>

			<div class="field">
				<label for="have">Already saved</label>
				<div class="input-prefix-wrap">
					<span class="input-prefix" aria-hidden="true">$</span>
					<input
						id="have"
						type="number"
						inputmode="decimal"
						min="0"
						step="1000"
						placeholder="0"
						bind:value={currentSavingsStr}
					/>
				</div>
				<p class="field-hint">Invested assets you already have. Leave blank to start from zero.</p>
			</div>
		</div>
	</details>
</form>

<!-- The bridge: savings rate -> years, at the current assumptions -->
<section class="fi-table-section" aria-label="Savings rate to years table">
	<h2 class="table-heading">The whole picture</h2>
	<p class="table-note">
		Years to financial independence at each savings rate, starting from zero ({realReturn}% real
		return, {withdrawal}% withdrawal). The striking part: the dollars don't matter — only the rate
		does. Your slider is highlighted.
	</p>
	<table class="fi-table">
		<thead>
			<tr>
				<th scope="col">Save this much</th>
				<th scope="col" class="num">Years to freedom</th>
			</tr>
		</thead>
		<tbody>
			{#each table as row (row.savingsRatePercent)}
				<tr class:active={highlightRate === row.savingsRatePercent}>
					<td>{row.savingsRatePercent}%</td>
					<td class="num">{yearsCell(row.yearsToFI)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

<p class="disclaimer">
	Rough math, not advice. It assumes you spend whatever you don't save, a steady savings rate,
	returns already adjusted for inflation, and it ignores taxes and Social Security — both of which
	can move the real answer. Treat it as a feel for the shape, not a plan.
</p>

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

	.intro {
		color: var(--text);
		font-size: 1.0625rem;
		margin-top: var(--space-sm);
	}

	.group-label {
		font-weight: 600;
		font-size: 0.9375rem;
	}

	/* Segmented toggle (period) — mirrors the tip calculator */
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
		padding: var(--space-sm);
	}

	.segmented .btn-toggle:hover {
		border-color: var(--terracotta);
	}

	.segmented .btn-toggle.selected {
		border-color: var(--terracotta);
		background: var(--terracotta);
		color: white;
	}

	.segmented .btn-toggle:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
	}

	/* Dollar prefix / percent suffix (matches the tip calculator) */
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

	/* Savings slider */
	.slider-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-sm);
	}

	.slider-pct {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--terracotta);
		font-variant-numeric: tabular-nums;
	}

	.slider {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 8px;
		border-radius: 999px;
		background: var(--surface);
		border: 1px solid var(--border);
		outline: none;
		margin: var(--space-sm) 0 var(--space-xs);
		cursor: pointer;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--terracotta);
		border: 3px solid white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
		cursor: pointer;
	}

	.slider::-moz-range-thumb {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--terracotta);
		border: 3px solid white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
		cursor: pointer;
	}

	.slider:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 4px;
	}

	.slider-readout {
		font-size: 0.9375rem;
		color: var(--text);
		line-height: 1.5;
	}

	.slider-readout strong {
		color: var(--dark);
	}

	/* Result block — hero figures */
	.result {
		background: var(--surface);
		border-radius: var(--radius);
		padding: var(--space-md);
		margin-bottom: var(--space-md);
	}

	.hero-grid {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.hero-cell {
		flex: 1;
		min-width: 130px;
	}

	.hero-label {
		font-size: 0.8125rem;
		color: var(--muted);
		margin-bottom: 0.25rem;
	}

	.hero-value {
		font-family: var(--font-display);
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1.1;
		color: var(--dark);
		letter-spacing: -0.01em;
	}

	.readout {
		margin-top: var(--space-md);
		padding-top: var(--space-sm);
		border-top: 1px solid var(--border);
		font-size: 0.9375rem;
		line-height: 1.55;
		color: var(--text);
	}

	.result-empty {
		font-size: 0.9375rem;
		color: var(--muted);
		margin-bottom: var(--space-md);
	}

	/* Adjust assumptions — collapsed advanced section */
	.assumptions-details {
		margin-top: var(--space-sm);
	}

	.assumptions-summary {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--muted);
		cursor: pointer;
		min-height: 44px;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-wrap: wrap;
		list-style: none;
	}

	.assumptions-summary::-webkit-details-marker {
		display: none;
	}

	.assumptions-summary::before {
		content: '▸';
		font-size: 0.75rem;
		transition: transform 0.15s;
	}

	.assumptions-details[open] .assumptions-summary::before {
		transform: rotate(90deg);
	}

	.assumptions-summary:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	.assumptions-current {
		color: var(--terracotta);
		font-weight: 600;
	}

	.assumptions-body {
		margin-top: var(--space-md);
		padding: var(--space-md);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.assumptions-body .field:last-child {
		margin-bottom: 0;
	}

	/* Savings-rate table */
	.fi-table-section {
		margin-top: var(--space-xl);
	}

	.table-heading {
		margin-bottom: var(--space-xs);
	}

	.table-note {
		font-size: 0.875rem;
		color: var(--muted);
		margin-bottom: var(--space-md);
		line-height: 1.55;
	}

	.fi-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 1rem;
	}

	.fi-table th,
	.fi-table td {
		padding: var(--space-sm) var(--space-md);
		text-align: left;
		border-bottom: 1px solid var(--border);
	}

	.fi-table th {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.fi-table td {
		font-weight: 600;
		color: var(--dark);
	}

	.fi-table .num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.fi-table tbody tr.active {
		background: var(--cream);
	}

	.fi-table tbody tr.active td {
		color: var(--terracotta);
		font-weight: 700;
	}

	.disclaimer {
		margin-top: var(--space-lg);
		font-size: 0.8125rem;
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
</style>
