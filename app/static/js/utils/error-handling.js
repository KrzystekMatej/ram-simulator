export function prefixFunctionErrors(prefix, fn, ...args) {
    try {
        return fn(...args);
    }
    catch (err) {
        throw new Error(`${prefix}${getErrorMessage(err)}`);
    }
}
export function prefixMethodErrors(prefix, method, thisArg, ...args) {
    try {
        return method.apply(thisArg, args);
    }
    catch (err) {
        throw new Error(`${prefix}${getErrorMessage(err)}`);
    }
}
export function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
