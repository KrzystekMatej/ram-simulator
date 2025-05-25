
export function intDiv(a: number, b: number): number {
    return a / b >= 0 ? Math.floor(a / b) : Math.ceil(a / b);
}

export function safeNumberOperation(operation: (...args: number[]) => number, ...args: number[]): number | undefined {
    const result = operation(...args);
    return Number.isSafeInteger(result) ? result : undefined;
}

export function safeAdd(a: number, b: number): number {
    const result = safeNumberOperation((x, y) => x + y, a, b);
    if (result === undefined) {
        throw new Error(`Došlo k přetečení Javascript typu 'number' při operaci: ${a} + ${b}`);
    }
    return result;
}

export function safeSub(a: number, b: number): number {
    const result = safeNumberOperation((x, y) => x - y, a, b);
    if (result === undefined) {
        throw new Error(`Došlo k přetečení Javascript typu 'number' při operaci: ${a} - ${b}`);
    }
    return result;
}

export function safeMul(a: number, b: number): number {
    const result = safeNumberOperation((x, y) => x * y, a, b);
    if (result === undefined) {
        throw new Error(`Došlo k přetečení Javascript typu 'number' při operaci: ${a} * ${b}`);
    }
    return result;
}

export function safeIntDiv(a: number, b: number): number {
    if (b === 0) throw new Error(`Dělení nulou: ${a} / ${b}`);

    const result = safeNumberOperation((x, y) => intDiv(x, y), a, b);
    if (result === undefined) {
        throw new Error(`Došlo k přetečení Javascript typu 'number' při operaci: ${a} / ${b}`);
    }
    return result;
}