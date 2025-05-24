
export function prefixFunctionErrors<TArgs extends any[], TResult>(
    prefix: string, fn: (...args: TArgs) => TResult,
    ...args: TArgs
): TResult {
    try {
        return fn(...args);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`${prefix}${message}`);
    }
}

export function prefixMethodErrors<T, TArgs extends any[], TResult>(
    prefix: string,
    method: (this: T, ...args: TArgs) => TResult,
    thisArg: T,
    ...args: TArgs
): TResult {
    try {
        return method.apply(thisArg, args);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`${prefix}${msg}`);
    }
}