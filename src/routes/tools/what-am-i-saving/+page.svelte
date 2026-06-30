<script lang="ts">
	import { estimateSavings } from '$lib/calculators/savings';

	// Take-home is the anchor; the rest is "what you save on purpose."
	let takeHomeStr = $state('');
	let retirementStr = $state(''); // 401k / retirement, % of take-home
	let autoTransferStr = $state(''); // $ auto-moved to savings
	let otherStr = $state(''); // $ any other regular saving
	let period = $state<'month' | 'year'>('month');

	const takeHome = $derived(Math.max(parseFloat(takeHomeStr) || 0, 0));
	const retirementPercent = $derived(Math.min(Math.max(parseFloat(retirementStr) || 0, 0), 100));
	const autoTransfer = $derived(Math.max(parseFloat(autoTransferStr) || 0, 0));
	const other = $derived(Math.max(parseFloat(otherStr) || 0, 0));

	const result = $derived(
		estimateSavings({ takeHome, retirementPercent, autoTransfer, other })
	);

	const periodLabel = $derived(period === 'month' ? 'mo' : 'yr');
	const ratePretty = $derived(Math.round(result.savingsRatePercent));

	// Hand the realistic rate straight to the retirement tool's slider.
	const retireHref = $derived(
		`/tools/financial-independence?takehome=${encodeURIComponent(
			takeHomeStr || '0'
		)}&rate=${ratePretty}&period=${period}`
	);

	function dollars(n: number): string {
		return `$${Math.round(n).toLocaleString('en-US')}`;
	}
</script>

<svelte:head>
	<title>What Am I Actually Saving? | refriedlabs</title>
	<meta
		name="description"
		content="You don't need a budget. Name what you save on purpose — your 401k, an auto-transfer — and see your real savings rate, then carry it into the retirement calculator."
	/>
</svelte:head>

<nav class="breadcrumb" aria-label="Breadcrumb">
	<a href="/">← refriedlabs</a>
</nav>

<h1>What Am I Actually Saving?</h1>

<p class="intro">
	Most people have no idea what they spend — it just evaporates from the account. But you usually
	<em>do</em> know what you save on purpose. Name those, and we'll turn it into a real number.
</p>

<hr class="divider" />

<form class="save-form" onsubmit={(e) => e.preventDefault()} novalidate>
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

	<!-- What you save on purpose -->
	<fieldset class="savings-group">
		<legend>What you save on purpose</legend>

		<div class="field">
			<label for="retirement">401k / retirement contribution</label>
			<div class="input-suffix-wrap">
				<input
					id="retirement"
					type="number"
					inputmode="decimal"
					min="0"
					max="100"
					step="1"
					placeholder="6"
					bind:value={retirementStr}
				/>
				<span class="input-suffix" aria-hidden="true">%</span>
			</div>
			<p class="field-hint">The percent off your paycheck. Leave blank if you don't have one.</p>
		</div>

		<div class="field">
			<label for="transfer">Auto-transfer to savings, per {period}</label>
			<div class="input-prefix-wrap">
				<span class="input-prefix" aria-hidden="true">$</span>
				<input
					id="transfer"
					type="number"
					inputmode="decimal"
					min="0"
					step="50"
					placeholder="200"
					bind:value={autoTransferStr}
				/>
			</div>
			<p class="field-hint">A standing transfer that fires automatically. Blank if none.</p>
		</div>

		<div class="field">
			<label for="other">Anything else you set aside, per {period}</label>
			<div class="input-prefix-wrap">
				<span class="input-prefix" aria-hidden="true">$</span>
				<input
					id="other"
					type="number"
					inputmode="decimal"
					min="0"
					step="50"
					placeholder="0"
					bind:value={otherStr}
				/>
			</div>
			<p class="field-hint">Brokerage deposits, a side stash — only what's regular.</p>
		</div>
	</fieldset>

	<!-- Result -->
	{#if result.hasInput}
		<section class="result" aria-live="polite" aria-label="Your savings rate">
			<div class="hero-grid">
				<div class="hero-cell">
					<div class="hero-label">You're saving about</div>
					<div class="hero-value">{dollars(result.totalSavings)}<span class="per">/{periodLabel}</span></div>
				</div>
				<div class="hero-cell">
					<div class="hero-label">Of your take-home</div>
					<div class="hero-value">{ratePretty}%</div>
				</div>
			</div>

			{#if result.totalSavings > 0}
				<p class="readout">
					That's a real, honest floor — it counts only what you save deliberately. The occasional
					"didn't spend it all" month is a bonus on top.
				</p>
				<a class="handoff" href={retireHref}>See when you could retire at {ratePretty}% →</a>
			{:else}
				<p class="readout">
					Nothing set aside on purpose yet. That's the most common starting point — and the easiest
					thing to change: one automatic transfer, however small, moves this off zero.
				</p>
				<a class="handoff" href="/tools/financial-independence">Play with the retirement math →</a>
			{/if}
		</section>
	{:else}
		<p class="result-empty">Enter your take-home pay to see your real savings rate.</p>
	{/if}
</form>

<p class="disclaimer">
	A rough read, not advice. It treats your 401k percent as a share of take-home (close enough for a
	gut check) and counts only regular, deliberate saving — so it's a floor, not a ceiling. The point
	is a realistic number to start from, not a precise audit.
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

	/* Segmented toggle (period) */
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

	/* Dollar prefix / percent suffix */
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

	/* Grouped "what you save" block */
	.savings-group {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: var(--space-md);
		margin-bottom: var(--space-md);
	}

	.savings-group legend {
		font-weight: 700;
		font-size: 0.9375rem;
		padding: 0 var(--space-xs);
		color: var(--dark);
	}

	.savings-group .field:last-child {
		margin-bottom: 0;
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

	.hero-value .per {
		font-size: 1rem;
		font-weight: 600;
		color: var(--muted);
	}

	.readout {
		margin-top: var(--space-md);
		padding-top: var(--space-sm);
		border-top: 1px solid var(--border);
		font-size: 0.9375rem;
		line-height: 1.55;
		color: var(--text);
	}

	.handoff {
		display: inline-block;
		margin-top: var(--space-md);
		font-weight: 700;
		color: var(--terracotta);
		text-decoration: none;
		min-height: 44px;
		line-height: 44px;
	}

	.handoff:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.handoff:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	.result-empty {
		font-size: 0.9375rem;
		color: var(--muted);
		margin-bottom: var(--space-md);
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
