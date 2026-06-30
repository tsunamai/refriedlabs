<svelte:head>
	<title>refriedlabs</title>
	<meta name="description" content="Tools built for a use case of one." />
</svelte:head>

<p class="tagline">Tools built for a use case of one.</p>

<div class="mascot-wrap">
	<img src="/bean.png" alt="Bean, the refriedlabs mascot" class="mascot" />
</div>

<ul class="tool-list">
	<li class="tool-card">
		<a href="/tools/how-to-tip" class="tool-link">
			<span class="tool-name">How to Tip in the US</span>
			<span class="tool-desc">A free guide for visitors — who to tip, how much, and why.</span>
		</a>
	</li>
	<li class="tool-card">
		<a href="/tools/tip-calculator" class="tool-link">
			<span class="tool-name">Tip Calculator</span>
		</a>
	</li>
	<li class="tool-card">
		<a href="/tools/financial-independence" class="tool-link">
			<span class="tool-name">When Can I Retire?</span>
			<span class="tool-desc">Your savings rate, your number, and the years to financial independence.</span>
		</a>
	</li>
</ul>

<style>
	.tagline {
		color: var(--muted);
		margin-bottom: var(--space-xl);
		font-size: 1.0625rem;
	}

	.mascot-wrap {
		display: flex;
		justify-content: center;
		margin-bottom: var(--space-xl);
	}

	.mascot {
		width: 160px;
		height: 160px;
		object-fit: contain;
		mix-blend-mode: multiply;
	}

	.tool-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.tool-card {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: white;
		transition: border-color 0.15s;
	}

	.tool-card:hover {
		border-color: var(--chili);
	}

	.tool-link {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding: var(--space-md);
		text-decoration: none;
		color: inherit;
	}

	.tool-link:focus-visible {
		outline: 3px solid var(--chili);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	.tool-name {
		font-weight: 700;
		font-size: 1rem;
		color: var(--ink);
	}

	.tool-desc {
		font-size: 0.875rem;
		color: var(--muted);
	}


</style>
