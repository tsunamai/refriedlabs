<script lang="ts">
	import { TIP_GUIDE, TIP_GUIDE_INTRO } from '$lib/data/tip-guide';
	import WageByState from '$lib/components/WageByState.svelte';
	import type { TipExpectation } from '$lib/types/bill';

	const BADGE: Record<TipExpectation, { label: string; cls: string }> = {
		expected: { label: 'Expected', cls: 'b-expected' },
		optional: { label: 'Optional', cls: 'b-optional' },
		extraOnly: { label: 'Extra / bonus', cls: 'b-extra' },
		checkFirst: { label: 'Check the bill', cls: 'b-check' },
		notCustomary: { label: 'Not customary', cls: 'b-none' }
	};
</script>

<svelte:head>
	<title>How to Tip in the US — Free Guide for Visitors</title>
	<meta
		name="description"
		content="A free, honest guide to tipping in the United States for visitors. What to tip at restaurants, hotels, taxis, salons, delivery and more — plus how the tipped-wage system works state by state. No ads, no account."
	/>
</svelte:head>

<article class="guide">
	<h1>How to Tip in the US</h1>
	<p class="intro">{TIP_GUIDE_INTRO}</p>
	<p class="intro">
		Not sure if your tip is someone’s wage or a bonus? <a href="#wages">See how it works by state ↓</a>
	</p>

	<section id="wages" class="wages">
		<h2>Is my tip their wage?</h2>
		<WageByState />
	</section>

	{#each TIP_GUIDE as category (category.id)}
		<section class="category">
			<h2>{category.title}</h2>
			{#each category.situations as s (s.id)}
				<details class="sit">
					<summary>
						<span class="sit-head">
							<span class="sit-title">{s.title}</span>
							<span class="badge {BADGE[s.expectation].cls}">{BADGE[s.expectation].label}</span>
						</span>
						<span class="amount">{s.amount}</span>
					</summary>
					<p class="note">{s.note}</p>
				</details>
			{/each}
		</section>
	{/each}

	<p class="footnote">
		Ranges are common US norms, not rules — when in doubt, a little is kinder than nothing. Free,
		no account, nothing tracked. · <a href="/tools/tip-calculator">Open the tip calculator →</a>
	</p>
</article>

<style>
	.guide {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	h1 {
		font-family: var(--font-display);
		font-size: 1.75rem;
	}

	.intro {
		color: var(--muted);
	}

	.intro a {
		color: var(--chili);
	}

	.wages {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: var(--space-md);
		background: white;
	}

	h2 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin-bottom: var(--space-sm);
	}

	.category {
		display: flex;
		flex-direction: column;
	}

	.sit {
		border-bottom: 1px solid var(--border);
	}

	summary {
		cursor: pointer;
		padding: var(--space-sm) 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	summary:focus-visible {
		outline: 3px solid var(--chili);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	.sit-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
	}

	.sit-title {
		font-weight: 600;
	}

	.amount {
		color: var(--muted);
		font-size: 0.9375rem;
		padding-left: 1.1rem; /* align under title, past the disclosure marker */
	}

	.note {
		padding: 0 0 var(--space-sm) 1.1rem;
		color: var(--ink);
	}

	.badge {
		flex: none;
		color: var(--ink);
		background: var(--surface);
		padding: 0.12rem 0.5rem;
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 600;
		white-space: nowrap;
	}

	/* Light tints — text stays dark (--ink) for AA contrast; color is a secondary cue,
	   the word label is the primary signal (WCAG 1.4.1). */
	.b-expected {
		background: rgba(46, 107, 62, 0.18);
	}
	.b-optional {
		background: rgba(232, 135, 58, 0.22);
	}
	.b-extra {
		background: rgba(184, 92, 56, 0.22);
	}
	.b-check {
		background: rgba(139, 35, 21, 0.16);
	}
	.b-none {
		background: rgba(122, 99, 85, 0.2);
	}

	.footnote {
		color: var(--muted);
		font-size: 0.875rem;
	}

	.footnote a {
		color: var(--chili);
	}
</style>
