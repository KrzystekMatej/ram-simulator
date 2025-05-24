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
