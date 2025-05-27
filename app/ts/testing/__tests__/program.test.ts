import {RamTuringSimulator as SimulationTester} from "../../core/ram-turing-simulator";
import {
    Instruction as MicroInstruction,
    InstructionId as MicroInstructionId
} from "../../core/micro-ram/instruction";
import fs from "fs";
import path from "path";
import {factorial, readProgramFromFile} from "../helpers";
import {arraysEqual} from "../../utils/collections";


let simulationTester: SimulationTester;

beforeAll(() => {
    const sets = fs.readFileSync(
        path.join(__dirname, '../../../static/assets/turing-sets.txt'),
        'utf-8'
    );
    simulationTester = new SimulationTester(sets, true);
});

describe('Micro programs', () => {
    const examples: [string, any[]][] = [
        ['add', [
            [[2, 3], [5]],
            [[100, 250], [350]],
            [[0, 0], [0]],
            [[999, 1], [1000]]
        ]],
        ['sub', [
            [[5, 3], [-2]],
            [[10, 10], [0]],
            [[0, 5], [5]],
            [[100, 250], [150]]
        ]],
        ['mul', [
            [[2, 3], [6]],
            [[10, 0], [0]],
            [[7, -4], [-28]],
            [[12, 12], [144]]
        ]],
        ['div', [
            [[3, 7], [2]],
            [[2, 10], [5]],
            [[5, 2], [0]],
            [[5, -10], [-2]]
        ]]
    ];

    examples.forEach((example) => {
        const [programName, ios] = example;
        test(`Testing program ${programName}`, () => {
            const instructions = readProgramFromFile('micro', programName);

            ios.forEach((io) => {
                const [inputs, expectedOutputs] = io;
                instructions[0] = new MicroInstruction(MicroInstructionId.Init, inputs);
                simulationTester.initialize(instructions);
                simulationTester.executeAllRam();
                expect(arraysEqual(simulationTester.ramMachine.output.getFullContents(0)[1], expectedOutputs))
                    .toBe(true);
            })
        });
    });
});

describe('Macro programs', () => {
    const examples: [string, any[]][] = [
        ['exponential-iterator', [
            [[1], [4]],
            [[2], [16]],
            [[3], [256]],
            [[4], [65536]],
            [[5], [4294967296]]
        ]],
        ['factorial', [
            [[0], [factorial(0)]],
            [[1], [factorial(1)]],
            [[2], [factorial(2)]],
            [[3], [factorial(3)]],
            [[7], [factorial(7)]],
            [[10], [factorial(10)]],
            [[17], [factorial(17)]],
        ]], ['pow', [
            [[2, 0], [Math.pow(2, 0)]],
            [[2, 3], [Math.pow(2, 3)]],
            [[5, 4], [Math.pow(5, 4)]],
            [[10, 2], [Math.pow(10, 2)]],
            [[7, 5], [Math.pow(7, 5)]],
            [[3, 6], [Math.pow(3, 6)]],
        ]], ['find-max', [
            [[1, 42], [42]],
            [[2, 5, 3], [5]],
            [[3, -1, -5, -3], [-1]],
            [[5, 1, 2, 3, 2, 1], [3]],
            [[6, 7, 7, 7, 7, 7, 7], [7]],
            [[4, 100, 20, 300, 10], [300]],
        ]], ['sum', [
            [[0], [0]],
            [[1, 5], [5]],
            [[3, 2, 4, 6], [12]],
            [[4, -1, -2, -3, -4], [-10]],
            [[5, 10, 20, 30, 40, 50], [150]],
            [[6, 1, 1, 1, 1, 1, 1], [6]],
        ]]
    ];

    examples.forEach((example) => {
        const [programName, ios] = example;
        test(`Testing program ${programName}`, () => {
            const instructions = readProgramFromFile('macro', programName);

            ios.forEach((io) => {
                const [inputs, expectedOutputs] = io;
                instructions[0] = new MicroInstruction(MicroInstructionId.Init, inputs);
                simulationTester.initialize(instructions);
                simulationTester.executeAllRam();
                expect(arraysEqual(simulationTester.ramMachine.output.getFullContents(0)[1], expectedOutputs))
                    .toBe(true);
            })
        });
    });
});
