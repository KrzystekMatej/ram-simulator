
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

export function invertMap<K, V>(inputMap: Map<K, V>): Map<V, K> {
    const inverted = new Map<V, K>();

    for (const [key, value] of inputMap.entries()) {
        if (inverted.has(value)) {
            throw new Error(`Duplicate value '${value}' encountered – cannot invert uniquely.`);
        }
        inverted.set(value, key);
    }

    return inverted;
}

export function range(start: number, end?: number, step: number = 1): number[] {
    if (step === 0) {
        throw new Error("Step can't be 0.");
    }

    if (end === undefined) {
        end = start;
        start = 0;
    }

    const isAscending = step > 0;
    const conditionFails = (isAscending && start >= end) || (!isAscending && start <= end);

    if (conditionFails) {
        throw new Error(`Combination start=${start}, end=${end}, step=${step} is not consistent.`);
    }

    const result: number[] = [];

    if (isAscending) {
        for (let i = start; i < end; i += step) {
            result.push(i);
        }
    } else {
        for (let i = start; i > end; i += step) {
            result.push(i);
        }
    }

    return result;
}


export function buildIdentityMap(count: number): Map<number, number> {
    let map: Map<number, number> = new Map();
    for  (let i = 0; i < count; i++) {
        map.set(i, i);
    }
    return map;
}
