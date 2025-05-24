export function intDiv(a, b) {
    return a / b >= 0 ? Math.floor(a / b) : Math.ceil(a / b);
}
export function safeNumberOperation(operation, ...args) {
    const result = operation(...args);
    return Number.isSafeInteger(result) ? result : undefined;
}
export function safeAdd(a, b) {
    const result = safeNumberOperation((x, y) => x + y, a, b);
    if (result === undefined) {
        throw new Error(`Integer overflow: ${a} + ${b}`);
    }
    return result;
}
export function safeSub(a, b) {
    const result = safeNumberOperation((x, y) => x - y, a, b);
    if (result === undefined) {
        throw new Error(`Integer overflow: ${a} - ${b}`);
    }
    return result;
}
export function safeMul(a, b) {
    const result = safeNumberOperation((x, y) => x * y, a, b);
    if (result === undefined) {
        throw new Error(`Integer overflow: ${a} * ${b}`);
    }
    return result;
}
export function safeIntDiv(a, b) {
    if (b === 0)
        throw new Error(`Division by zero: ${a} / ${b}`);
    const result = safeNumberOperation((x, y) => intDiv(x, y), a, b);
    if (result === undefined) {
        throw new Error(`Integer overflow: ${a} / ${b}`);
    }
    return result;
}
