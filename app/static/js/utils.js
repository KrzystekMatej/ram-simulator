export function logSeparator() {
    console.log("---------------------------------------------------");
}
export function splitOnce(input, delimiter) {
    const index = input.indexOf(delimiter);
    if (index === -1)
        return [input, ''];
    return [
        input.slice(0, index),
        input.slice(index + delimiter.length)
    ];
}
export function removeWhitespace(input) {
    return input.replace(/\s+/g, '');
}
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
export function IntToMinimalTwosComplement(value) {
    if (value === 0)
        return '0';
    if (!Number.isSafeInteger(value)) {
        throw new Error(`Conversion error: ${value} is not a safe integer`);
    }
    if (value > 0) {
        return '0' + value.toString(2);
    }
    const absBinary = Math.abs(value).toString(2).split('');
    let foundOne = false;
    for (let i = absBinary.length - 1; i >= 0; i--) {
        if (foundOne) {
            absBinary[i] = absBinary[i] === '0' ? '1' : '0';
        }
        else if (absBinary[i] === '1' && i !== 0) {
            foundOne = true;
        }
    }
    if (foundOne)
        absBinary.unshift('1');
    return absBinary.join('');
}
export function twosComplementToInt(bin) {
    const bits = BigInt(bin.length);
    let value = 0n;
    for (let i = 0; i < bin.length; i++) {
        if (bin[i] === '1') {
            value += 1n << BigInt(bin.length - i - 1);
        }
    }
    if (bin[0] === '1') {
        value -= 1n << bits;
    }
    const result = Number(value);
    if (!Number.isSafeInteger(result)) {
        throw new Error(`Parsing error: ${bin}`);
    }
    return result;
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
export function intDiv(a, b) {
    return a / b >= 0 ? Math.floor(a / b) : Math.ceil(a / b);
}
export function safeParseInteger(str) {
    const n = Number(str);
    if (Number.isSafeInteger(n)) {
        throw new Error(`Parsing error: ${str}`);
    }
    return n;
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
export function prefixFunctionErrors(prefix, fn, ...args) {
    try {
        return fn(...args);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`${prefix}${message}`);
    }
}
export function prefixMethodErrors(prefix, method, thisArg, ...args) {
    try {
        return method.apply(thisArg, args);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`${prefix}${msg}`);
    }
}
