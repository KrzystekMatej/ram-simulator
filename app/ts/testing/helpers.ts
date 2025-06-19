import { Faker } from '@faker-js/faker';
import {RamTuringSimulator as SimulationTester} from "../core/ram-turing-simulator";
import { intDiv } from "../utils/math";
import {Instruction as MicroInstruction, InstructionId as MicroInstructionId} from "../core/micro-ram/instruction";
import fs   from 'fs';
import path from 'path';
import {Compiler as MacroCompiler} from "../core/macro-ram/compiler";
import {Compiler as MicroCompiler} from "../core/micro-ram/compiler";
import {ToMicroTranspiler} from "../core/macro-ram/to-micro-transpiler";

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
        throw new Error("Probability has to be between 0 and 1.");
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

export function generatePairsWithRepetition<T>(arr: T[]): [T, T][] {
    const result: [T, T][] = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            result.push([arr[i], arr[j]]);
        }
    }
    return result;
}

export function testArithmetic(simulationTester: SimulationTester, operator: string, operands: [number, number][]) {

    operands.forEach(([a, b]) => {
        let result: number | undefined;

        switch (operator) {
            case "+":
                result = a + b;
                break;
            case "-":
                result = a - b;
                break;
            case "*":
                result = a * b;
                break;
            case "/":
                result = b === 0 ? undefined : intDiv(a, b);
                break;
            default:
                throw new Error("This operator is not known.");
        }

        try {
            simulationTester.initialize([
                new MicroInstruction(MicroInstructionId.Init),
                new MicroInstruction(MicroInstructionId.AssignConst, [b]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.AssignConst, [a]),
                new MicroInstruction(MicroInstructionId.Arithmetic, [operator]),
                new MicroInstruction(MicroInstructionId.Halt)
            ]);

            if (result === undefined)
            {
                expect(() => simulationTester.executeAllRam()).toThrow();
                return;
            }

            simulationTester.executeAllRam();
            expect(simulationTester.ramMachine.A).toBe(result);
        } catch (e) {
            throw new Error(`Simulation failed at input ${a} ${operator} ${b} = ${result}: ${e}`);
        }
    });
}

export function readProgramFromFile(programType: string, programName: string): MicroInstruction[] {
    const filePath = path.resolve(__dirname, `../../static/assets/programs/${programType}/${programName}.ram`);
    const text = fs.readFileSync(filePath, 'utf-8');

    if (programType === "macro") {
        const macroCompiler: MacroCompiler = new MacroCompiler();
        const transpiler: ToMicroTranspiler = new ToMicroTranspiler();
        return transpiler.transpile(macroCompiler.compile(text)[0])[0];
    } else if (programType === "micro") {
        const microCompiler: MicroCompiler = new MicroCompiler();
        return microCompiler.compile(text)[0];
    } else throw new Error("Non existing type of program!");
}

export function factorial(n: number): number {
    if (n < 0) {
        throw new Error("Faktoriál není definován pro záporná čísla.");
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}