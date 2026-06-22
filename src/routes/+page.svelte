<svelte:head>
	<title>refriedlabs</title>
	<meta name="description" content="Tools built for a use case of one." />
</svelte:head>

<h1>refriedlabs</h1>
<p class="tagline">Tools built for a use case of one.</p>

<ul class="tool-list">
	<li class="tool-card">
		<a href="/tools/tip-calculator" class="tool-link">
			<span class="tool-name">Tip Calculator</span>
		</a>
	</li>
</ul>

<style>
	h1 {
		margin-bottom: var(--space-xs);
	}

	.tagline {
		color: var(--muted);
		margin-bottom: var(--space-xl);
		font-size: 1.0625rem;
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
		font-size: 0.9375rem;
		color: var(--muted);
		line-height: 1.5;
	}
</style>
