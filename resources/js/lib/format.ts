/** "150,000 ကျပ်" */
export function formatKyat(n: number): string {
    return `${n.toLocaleString('en-US')} ကျပ်`;
}

export function formatNumber(n: number): string {
    return n.toLocaleString('en-US');
}

/** "23 Nov 2026"; returns an em dash for missing/invalid input. */
export function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

/** 45 -> "45 မိနစ်", 90 -> "1 နာရီ 30 မိနစ်", 120 -> "2 နာရီ" */
export function formatMinutes(min: number): string {
    if (min < 60) return `${min} မိနစ်`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h} နာရီ` : `${h} နာရီ ${m} မိနစ်`;
}
