export function splitOnce(input: string, delimiter: string): [string, string] {
    const index = input.indexOf(delimiter);
    if (index === -1) return [input, ''];
    return [
        input.slice(0, index),
        input.slice(index + delimiter.length)
    ];
}

export function removeWhitespace(input: string): string {
    return input.replace(/\s+/g, '');
}

export function IntToMinimalTwosComplement(value: number): string {
    if (value === 0) return '0';

    if (!Number.isSafeInteger(value)) {
        throw new Error(`Nepodařilo se převést číslo ${value} na řetězce - nejedná se o bezpečné číslo typu 'number' (64bit float)`);
    }

    if (value > 0) {
        return '0' + value.toString(2);
    }

    const absBinary = Math.abs(value).toString(2).split('');

    let foundOne = false;
    for (let i = absBinary.length - 1; i >= 0; i--) {
        if (foundOne) {
            absBinary[i] = absBinary[i] === '0' ? '1' : '0';
        } else if (absBinary[i] === '1' && i !== 0) {
            foundOne = true;
        }
    }

    if (foundOne) absBinary.unshift('1');
    return absBinary.join('');
}


export function twosComplementToInt(bin: string): number {
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
        throw new Error(`Nepodařilo se převést ${bin} na bezpečné číslo typu 'number' (64bit float)`);
    }

    return result;
}

export function safeParseInteger(str: string): number | undefined {
    const n = Number(str);
    if (!Number.isSafeInteger(n))
    {
        throw new Error(`Nepodařilo se převést ${str} na bezpečné číslo typu 'number' (64bit float)`);
    }
    return n;
}