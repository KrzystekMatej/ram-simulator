

export function prepareTestNumbers(): number[] {
    let testNumbers: number[] = [
        -6364523, -364932, -75623, -5456, 4863, 23562, 113691, 2648963
    ];

    for (let i = -100; i <= 100; i++) {
        testNumbers.push(i);
    }
    return testNumbers;
}