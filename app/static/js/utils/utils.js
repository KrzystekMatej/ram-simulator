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
    if (value > 0) {
        return '0' + value.toString(2);
    }
    const absBinary = Math.abs(value).toString(2).split('');
    let foundOne = false;
    for (let i = absBinary.length - 1; i >= 0; i--) {
        if (foundOne) {
            absBinary[i] = absBinary[i] === '0' ? '1' : '0';
        }
        else if (absBinary[i] === '1') {
            foundOne = true;
        }
    }
    absBinary.unshift('1');
    return absBinary.join('');
}
export function twosComplementToInt(bin) {
    const bits = bin.length;
    const value = parseInt(bin, 2);
    if (bin[0] === '1') {
        return value - (1 << bits);
    }
    return value;
}
