// Roving tabindex handler for ARIA radiogroup patterns.
// Moves focus and calls onChange(nextIndex) on arrow key press.
// Usage: onkeydown={(e) => handleRovingKeydown(e, count, current, onChange)}
export function handleRovingKeydown(
	e: KeyboardEvent,
	count: number,
	current: number,
	onChange: (next: number) => void
): void {
	if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
	e.preventDefault();
	const next =
		e.key === 'ArrowRight' || e.key === 'ArrowDown'
			? (current + 1) % count
			: (current - 1 + count) % count;
	onChange(next);
	const group = e.currentTarget as HTMLElement;
	const buttons = group.querySelectorAll<HTMLElement>('[role="radio"]');
	buttons[next]?.focus();
}
