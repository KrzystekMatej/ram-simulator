
export function prefixFunctionErrors<TArgs extends any[], TResult>(
    prefix: string, fn: (...args: TArgs) => TResult,
    ...args: TArgs
): TResult {
    try {
        return fn(...args);
    } catch (err) {
        throw new Error(`${prefix}${getErrorMessage(err)}`);
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
        throw new Error(`${prefix}${getErrorMessage(err)}`);
    }
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}