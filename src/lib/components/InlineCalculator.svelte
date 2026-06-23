<script lang="ts">
	let show = $state(false);
	let display = $state('0');
	let prev = $state<number | null>(null);
	let op = $state<string | null>(null);
	let fresh = $state(false);

	function fmt(n: number): string {
		if (!Number.isFinite(n)) return 'Error';
		return parseFloat(n.toPrecision(10)).toString();
	}

	function digit(d: string) {
		if (fresh || display === 'Error') { display = d; fresh = false; return; }
		if (display === '0' && d !== '0') { display = d; return; }
		if (display.length < 12) display += d;
	}

	function dot() {
		if (fresh || display === 'Error') { display = '0.'; fresh = false; return; }
		if (!display.includes('.')) display += '.';
	}

	function compute(a: number, b: number, o: string): number {
		if (o === '+') return a + b;
		if (o === '-') return a - b;
		if (o === '×') return a * b;
		if (o === '÷') return b !== 0 ? a / b : NaN;
		return b;
	}

	function operator(o: string) {
		if (display === 'Error') return;
		const cur = parseFloat(display);
		if (prev !== null && !fresh) {
			const res = compute(prev, cur, op!);
			display = fmt(res);
			prev = Number.isFinite(res) ? res : null;
		} else {
			prev = cur;
		}
		if (prev !== null) op = o;
		fresh = true;
	}

	function equals() {
		if (prev === null || op === null) return;
		const res = compute(prev, parseFloat(display), op);
		display = fmt(res);
		prev = null;
		op = null;
		fresh = true;
	}

	function clear() {
		display = '0'; prev = null; op = null; fresh = false;
	}

	function negate() {
		if (display === 'Error' || display === '0') return;
		display = fmt(-parseFloat(display));
	}

	function pct() {
		if (display === 'Error') return;
		display = fmt(parseFloat(display) / 100);
		fresh = true;
	}
</script>

<div class="calc-wrapper">
	<button
		type="button"
		class="calc-toggle"
		onclick={() => (show = !show)}
		aria-expanded={show}
		aria-controls="inline-calc"
	>
		{show ? 'Hide calculator' : 'Calculator'}
	</button>

	{#if show}
		<div class="calc" id="inline-calc" role="region" aria-label="Calculator">
			<div class="calc-display" aria-live="polite" aria-atomic="true">
				<span class="calc-display-value">{display}</span>
			</div>
			<div class="calc-grid" role="group" aria-label="Calculator buttons">
				<button type="button" class="calc-btn calc-fn" onclick={clear}>AC</button>
				<button type="button" class="calc-btn calc-fn" onclick={negate} aria-label="Toggle sign">+/−</button>
				<button type="button" class="calc-btn calc-fn" onclick={pct} aria-label="Percent">%</button>
				<button type="button" class="calc-btn calc-op" onclick={() => operator('÷')} aria-label="Divide">÷</button>
				<button type="button" class="calc-btn" onclick={() => digit('7')}>7</button>
				<button type="button" class="calc-btn" onclick={() => digit('8')}>8</button>
				<button type="button" class="calc-btn" onclick={() => digit('9')}>9</button>
				<button type="button" class="calc-btn calc-op" onclick={() => operator('×')} aria-label="Multiply">×</button>
				<button type="button" class="calc-btn" onclick={() => digit('4')}>4</button>
				<button type="button" class="calc-btn" onclick={() => digit('5')}>5</button>
				<button type="button" class="calc-btn" onclick={() => digit('6')}>6</button>
				<button type="button" class="calc-btn calc-op" onclick={() => operator('-')} aria-label="Subtract">−</button>
				<button type="button" class="calc-btn" onclick={() => digit('1')}>1</button>
				<button type="button" class="calc-btn" onclick={() => digit('2')}>2</button>
				<button type="button" class="calc-btn" onclick={() => digit('3')}>3</button>
				<button type="button" class="calc-btn calc-op" onclick={() => operator('+')} aria-label="Add">+</button>
				<button type="button" class="calc-btn calc-zero" onclick={() => digit('0')}>0</button>
				<button type="button" class="calc-btn" onclick={dot} aria-label="Decimal point">.</button>
				<button type="button" class="calc-btn calc-op" onclick={equals} aria-label="Equals">=</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.calc-wrapper {
		margin-top: var(--space-sm);
	}

	.calc-toggle {
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

	.calc-toggle::before {
		content: '▸';
		font-size: 0.75rem;
		display: inline-block;
		transition: transform 0.15s;
	}

	.calc-toggle[aria-expanded="true"]::before {
		transform: rotate(90deg);
	}

	.calc-toggle:hover { color: var(--terracotta); }

	.calc-toggle:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	.calc {
		margin-top: var(--space-md);
		border-radius: var(--radius);
		overflow: hidden;
		border: 1px solid var(--border);
		max-width: 340px;
	}

	.calc-display {
		background: var(--dark);
		padding: var(--space-md);
		text-align: right;
		min-height: 72px;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
	}

	.calc-display-value {
		font-size: 2.25rem;
		font-weight: 300;
		color: var(--cream);
		letter-spacing: -0.02em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}

	.calc-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1px;
		background: var(--border);
	}

	.calc-btn {
		background: var(--surface);
		color: var(--dark);
		border: none;
		font-family: var(--font);
		font-size: 1.25rem;
		font-weight: 400;
		min-height: 64px;
		cursor: pointer;
		transition: background 0.1s;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.calc-btn:hover { filter: brightness(0.93); }
	.calc-btn:active { filter: brightness(0.82); }

	.calc-btn:focus-visible {
		outline: 3px solid var(--terracotta);
		outline-offset: -3px;
	}

	.calc-fn { background: var(--border); }

	.calc-op {
		background: var(--terracotta);
		color: white;
		font-weight: 600;
	}

	.calc-zero {
		grid-column: span 2;
		justify-content: flex-start;
		padding-left: 1.5rem;
	}
</style>
