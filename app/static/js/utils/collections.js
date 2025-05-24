export function arraysEqual(a, b, equal = (x, y) => x === y) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (!equal(a[i], b[i]))
            return false;
    }
    return true;
}
export function indexOfRight(arr, val, pos) {
    for (let i = pos; i < arr.length; i++) {
        if (arr[i] === val)
            return i;
    }
    return -1;
}
export function indexOfLeft(arr, val, pos) {
    for (let i = pos; i >= 0; i--) {
        if (arr[i] === val)
            return i;
    }
    return -1;
}
export function mapsEqual(a, b, valueEqual = (x, y) => x === y) {
    if (a.size !== b.size)
        return false;
    for (const [key, aValue] of a) {
        if (!b.has(key))
            return false;
        const bValue = b.get(key);
        if (!valueEqual(aValue, bValue))
            return false;
    }
    return true;
}
export const range = (start, end) => Array.from({ length: end - start }, (_, i) => start + i);
