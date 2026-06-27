<script lang="ts">
	// Whether your tip is part of someone's wage or pure gratuity depends on state law.
	// Honest, data-driven: reuses the One Fair Wage data, no hardcoded state lists.
	import {
		STATE_OPTIONS,
		stateName,
		isOneFairWage,
		TIP_DATA_LAST_UPDATED
	} from '$lib/data/states';

	let selected = $state('');

	const chosen = $derived(selected !== '');
	const fullWage = $derived(chosen && isOneFairWage(selected));
	const name = $derived(stateName(selected));

	// Derived from data so the list never drifts from the source of truth.
	const fullWageStates = STATE_OPTIONS.filter((o) => isOneFairWage(o.code));
</script>

<div class="wage">
	<p class="intro">
		Whether your tip is part of someone’s wage or a true gratuity depends on state law.
	</p>

	<div class="field">
		<label for="wage-state">Which state are you in?</label>
		<select id="wage-state" bind:value={selected}>
			<option value="">Choose a state…</option>
			{#each STATE_OPTIONS as opt (opt.code)}
				<option value={opt.code}>{opt.name}</option>
			{/each}
		</select>
	</div>

	<div aria-live="polite">
		{#if chosen}
			<div class="callout {fullWage ? 'ok' : 'warn'}" role="note">
				<strong>{name}</strong>
				{#if fullWage}
					<span class="tag ok-tag">Full minimum wage</span>
					<p>Servers here earn the full minimum wage. Your tip is genuinely extra — still customary and appreciated, but not their base pay.</p>
				{:else}
					<span class="tag warn-tag">Tipped wage</span>
					<p>Employers here can pay as little as $2.13/hour and count your tips toward the minimum. Your tip is part of how servers are paid.</p>
				{/if}
			</div>
		{/if}
	</div>

	<section class="block">
		<h3 class="ok-heading">Full-wage states — tip is a bonus</h3>
		<p>In these states servers earn the full minimum wage before tips, so your tip is genuinely on top:</p>
		<ul class="states">
			{#each fullWageStates as s (s.code)}
				<li>{s.name}</li>
			{/each}
		</ul>
	</section>

	<section class="block">
		<h3 class="warn-heading">Everywhere else — tips fund their pay</h3>
		<p>
			Every other state lets employers pay a reduced cash wage — the federal floor is just
			<strong>$2.13/hour</strong>, unchanged since 1991 — and count your tips toward the minimum.
			There, tips are most of how servers are paid.
		</p>
	</section>

	<p class="verified">
		Exact tipped wages vary by state and some fall in between. Last verified {TIP_DATA_LAST_UPDATED};
		check <a href="https://onefairwage.site/" target="_blank" rel="noopener">onefairwage.site</a>.
	</p>
</div>

<style>
	.wage {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.intro {
		color: var(--muted);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.field label {
		font-weight: 600;
	}

	select {
		font: inherit;
		padding: var(--space-sm);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: white;
		color: var(--ink);
	}

	select:focus-visible {
		outline: 3px solid var(--chili);
		outline-offset: 2px;
	}

	.callout {
		border-radius: var(--radius);
		padding: var(--space-md);
		border-left: 4px solid var(--chili);
		background: var(--surface);
	}

	.callout.ok {
		border-left-color: var(--ok);
		background: var(--ok-surface);
	}

	.callout strong {
		font-size: 1.0625rem;
	}

	.callout p {
		margin-top: var(--space-xs);
	}

	.tag {
		display: inline-block;
		margin-left: var(--space-xs);
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		vertical-align: middle;
	}

	.ok-tag {
		background: var(--ok);
		color: white;
	}

	.warn-tag {
		background: var(--chili);
		color: white;
	}

	.block h3 {
		font-family: var(--font-display);
		font-size: 1rem;
		margin-bottom: var(--space-xs);
	}

	.ok-heading {
		color: var(--ok);
	}

	.warn-heading {
		color: var(--chili);
	}

	.states {
		margin-top: var(--space-xs);
		padding-left: 1.25rem;
		columns: 2;
	}

	.states li {
		margin-bottom: 0.15rem;
	}

	.verified {
		font-size: 0.8125rem;
		color: var(--muted);
	}
</style>
