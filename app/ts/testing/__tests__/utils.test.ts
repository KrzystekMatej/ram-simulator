
import { IntToMinimalTwosComplement, twosComplementToInt } from '../../utils';

describe('Twos complement conversion', () => {
    const safeNumbers: [number, string][] = [
        [0, '0'],
        [1, '01'],
        [-1, '1'],
        [2, '010'],
        [-2, '10'],
        [3, '011'],
        [-3, '101'],
        [127, '01111111'],
        [-128,'10000000'],
        [-30950675349, '100011001011001100100010110001101011'],
        [9007199254740991, '011111111111111111111111111111111111111111111111111111'],
        [-9007199254740991, '100000000000000000000000000000000000000000000000000001']
    ];

    const unsafeNumbers: [number, string][] = [
        [9007199254740992, '0100000000000000000000000000000000000000000000000000000'],
        [-9007199254740992, '100000000000000000000000000000000000000000000000000000'],
        [12007199254740992, '0101010101010000111101111101110010100111000000000000000'],
        [-12007199254740992, '1010101010101111000010000010001101011001000000000000000']
    ];



    test('Int to twos complement', () => {
        for  (const [number, twosComplement] of safeNumbers) {
            expect(IntToMinimalTwosComplement(number)).toBe(twosComplement);
        }

        for  (const [number, twosComplement] of unsafeNumbers) {
            expect(() => IntToMinimalTwosComplement(number)).toThrow();
        }
    });

    test('Twos complement to int', () => {
        for  (const [number, twosComplement] of safeNumbers) {
            expect(twosComplementToInt(twosComplement)).toBe(number);
        }

        for  (const [number, twosComplement] of unsafeNumbers) {
            expect(() => twosComplementToInt(twosComplement)).toThrow();
        }
    });
});
