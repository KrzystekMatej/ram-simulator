
export function arraysEqual<T>(a: T[], b: T[], equal: (x: T, y: T) => boolean = (x, y) => x === y): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (!equal(a[i], b[i])) return false;
    }
    return true;
}

export function indexOfRight<T>(arr: T[], val: T, pos: number): number {
    for (let i = pos; i < arr.length; i++) {
        if (arr[i] === val) return i;
    }
    return -1;
}

export function indexOfLeft<T>(arr: T[], val: T, pos: number): number {
    for (let i = pos; i >= 0; i--) {
        if (arr[i] === val) return i;
    }
    return -1;
}

export function mapsEqual<K, V>(a: Map<K, V>, b: Map<K, V>, valueEqual: (x: V, y: V) => boolean = (x, y) => x === y): boolean {
    if (a.size !== b.size) return false;

    for (const [key, aValue] of a) {
        if (!b.has(key)) return false;
        const bValue = b.get(key)!;
        if (!valueEqual(aValue, bValue)) return false;
    }

    return true;
}

export const range = (start: number, end: number): number[] =>
    Array.from({ length: end - start }, (_, i) => start + i);
