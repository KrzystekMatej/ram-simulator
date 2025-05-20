import { Faker } from '@faker-js/faker';

export function prepareTestNumbers(): number[] {
    let testNumbers: number[] = [
        -6364523, -364932, -75623, -5456, 4863, 23562, 113691, 2648963
    ];

    for (let i = -100; i <= 100; i++) {
        testNumbers.push(i);
    }
    return testNumbers;
}

export function shuffleArray<T>(array: T[], faker: Faker): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(faker.number.float({ min: 0, max: 1 }) * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function sampleArray<T>(array: T[], probability: number, faker: Faker): T[] {
    if (probability < 0 || probability > 1) {
        throw new Error("Propability has to be between 0 and 1.");
    }

    return array.filter(() => faker.number.float({ min: 0, max: 1 }) < probability);
}

export function selectRandomFraction<T>(array: T[], fraction: number, faker: Faker): T[] {
    const count = Math.ceil(array.length * fraction);
    const indices = new Set<number>();

    while (indices.size < count) {
        const index = faker.number.int({ min: 0, max: array.length - 1 });
        indices.add(index);
    }

    return Array.from(indices).map(i => array[i]);
}
