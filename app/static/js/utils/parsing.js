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
export function safeParseInteger(str) {
    const n = Number(str);
    if (Number.isSafeInteger(n)) {
        throw new Error(`Parsing error: ${str}`);
    }
    return n;
}
