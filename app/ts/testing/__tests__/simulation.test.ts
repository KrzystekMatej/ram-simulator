import * as path from 'path';
import * as fs from 'fs';
import {RamSimulator as SimulationTester} from "../../core/micro-ram/ram-simulator";
import {
    generatePairsWithRepetition,
    prepareTestNumbers,
    selectRandomFraction,
    shuffleArray,
    testArithmetic
} from "../helpers";
import {
    Instruction as MicroInstruction,
    InstructionId as MicroInstructionId
} from "../../core/micro-ram/instruction";
import {arraysEqual, intDiv} from "../../utils";
import {cs_CZ, Faker} from '@faker-js/faker';

const originalConsoleLog = console.log;
console.log = () => {};

const faker = new Faker({
  locale: cs_CZ,
  seed: 42
});

const testNumbers = prepareTestNumbers();
let simulationTester: SimulationTester;
const halt = new  MicroInstruction(MicroInstructionId.Halt);

beforeAll(() => {
    const sets = fs.readFileSync(
        path.join(__dirname, '../../../static/assets/turing-sets.txt'),
        'utf-8'
    );
    simulationTester = new SimulationTester(sets, true);
});

afterAll(() => {
    console.log = originalConsoleLog;
});

test('init', () => {
    simulationTester.initialize([new MicroInstruction(MicroInstructionId.Init, testNumbers), halt]);
    simulationTester.executeAllRam();
    expect(simulationTester.ramMachine.A).toBe(0);
    expect(simulationTester.ramMachine.B).toBe(0);
    expect(simulationTester.ramMachine.C).toBe(0);
    expect(Array.from(simulationTester.ramMachine.memory.entries()).length).toBe(0);
    expect(arraysEqual(simulationTester.ramMachine.input.getFullContents(0)[1], testNumbers)).toBe(true);
    expect(simulationTester.ramMachine.output.getFullContents(0)[1].length).toBe(0);
});

describe('assignment', () => {
    test('const', () => {
        for (const number of testNumbers){
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    halt
                ]);
                simulationTester.executeAllRam();
                expect(simulationTester.ramMachine.A).toBe(number);
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });

    test('register B', () => {
        for (const number of testNumbers) {
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.AssignB),
                    halt
                ]);
                simulationTester.executeAllRam();
                expect(simulationTester.ramMachine.B).toBe(number);
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });

    test('register C', () => {
        for (const number of testNumbers) {
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.AssignC),
                    halt
                ]);
                simulationTester.executeAllRam();
                expect(simulationTester.ramMachine.C).toBe(number);
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });
});

describe('io', () => {
    test('read', () => {
        for (const number of testNumbers) {
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.Init, [number]),
                    new MicroInstruction(MicroInstructionId.Read),
                    halt
                ]);
                simulationTester.executeAllRam();
                expect(simulationTester.ramMachine.A).toBe(number);
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }

        simulationTester.initialize([
            new MicroInstruction(MicroInstructionId.Init, [testNumbers[0]]),
            new MicroInstruction(MicroInstructionId.Read),
            new MicroInstruction(MicroInstructionId.Read),
            halt
        ]);
        expect(() => simulationTester.executeAllRam()).toThrow();
    });

    test('write', () => {
        try {
            let instructions: MicroInstruction[] = [new MicroInstruction(MicroInstructionId.Init, testNumbers)];
            testNumbers.forEach(() => {
                instructions.push(new MicroInstruction(MicroInstructionId.Read));
                instructions.push(new MicroInstruction(MicroInstructionId.Write));
            });
            instructions.push(halt);
            simulationTester.initialize(instructions);
            simulationTester.executeAllRam();
            expect(arraysEqual(simulationTester.ramMachine.output.getFullContents(0)[1], testNumbers)).toBe(true);
        } catch (e) {
            throw new Error(`Simulation failed: ${e}`);
        }
    });
});


describe('jumps', () => {
    test('jmp', () => {
        try {
            simulationTester.initialize([
                new MicroInstruction(MicroInstructionId.Init, testNumbers),
                new MicroInstruction(MicroInstructionId.Jump, [3]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [8]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [7]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                halt
            ]);
            simulationTester.executeAllRam();
            expect(simulationTester.ramMachine.A).toBe(0);
            expect(simulationTester.ramMachine.B).toBe(0);

            simulationTester.initialize([
                new MicroInstruction(MicroInstructionId.Init, testNumbers),
                new MicroInstruction(MicroInstructionId.Jump, [2]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [8]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [7]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                halt
            ]);
            simulationTester.executeAllRam();
            expect(simulationTester.ramMachine.A).toBe(1);
            expect(simulationTester.ramMachine.B).toBe(0);

            simulationTester.initialize([
                new MicroInstruction(MicroInstructionId.Init, testNumbers),
                new MicroInstruction(MicroInstructionId.Jump, [2]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [5]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [7]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                halt
            ]);
            simulationTester.executeAllRam();
            expect(simulationTester.ramMachine.A).toBe(0);
            expect(simulationTester.ramMachine.B).toBe(1);

            simulationTester.initialize([
                new MicroInstruction(MicroInstructionId.Init, testNumbers),
                new MicroInstruction(MicroInstructionId.Jump, [2]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [5]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [8]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                halt
            ]);
            simulationTester.executeAllRam();
            expect(simulationTester.ramMachine.A).toBe(1);
            expect(simulationTester.ramMachine.B).toBe(1);
        } catch (e) {
            throw new Error(`Simulation failed: ${e}`);
        }
    });

    test('je', () => {
        for (const number of testNumbers) {
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['==', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
                simulationTester.executeAllRam();
                if (number === 0) {
                    expect(simulationTester.ramMachine.A).toBe(number);
                }
                else {
                    expect(simulationTester.ramMachine.A).toBe(1);
                }
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });

    test('jne', () => {
        for (const number of testNumbers) {
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['!=', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
                simulationTester.executeAllRam();
                if (number !== 0) {
                    expect(simulationTester.ramMachine.A).toBe(number);
                }
                else {
                    expect(simulationTester.ramMachine.A).toBe(1);
                }
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });

    test('jle', () => {
        for (const number of testNumbers) {
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['<=', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
                simulationTester.executeAllRam();
                if (number <= 0) {
                    expect(simulationTester.ramMachine.A).toBe(number);
                }
                else {
                    expect(simulationTester.ramMachine.A).toBe(1);
                }
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });

    test('jge', () => {
        for (const number of testNumbers) {
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['>=', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
                simulationTester.executeAllRam();
                if (number >= 0) {
                    expect(simulationTester.ramMachine.A).toBe(number);
                }
                else {
                    expect(simulationTester.ramMachine.A).toBe(1);
                }
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });

    test('jl', () => {
        for (const number of testNumbers) {
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['<', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
                simulationTester.executeAllRam();
                if (number < 0) {
                    expect(simulationTester.ramMachine.A).toBe(number);
                }
                else {
                    expect(simulationTester.ramMachine.A).toBe(1);
                }
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });

    test('jg', () => {
        for (const number of testNumbers) {
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['>', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
                simulationTester.executeAllRam();
                if (number > 0) {
                    expect(simulationTester.ramMachine.A).toBe(number);
                }
                else {
                    expect(simulationTester.ramMachine.A).toBe(1);
                }
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });
});

describe('memory', () => {
    let addresses = shuffleArray(selectRandomFraction(testNumbers, 0.2, faker), faker);
    let values = shuffleArray(selectRandomFraction(testNumbers, 0.2, faker), faker);

    test('store', () => {
         try {
            let instructions: MicroInstruction[] = [new MicroInstruction(MicroInstructionId.Init)];
            for (let i = 0; i < addresses.length; i++) {
                const address = addresses[i];
                const value = values[i];

                instructions.push(new MicroInstruction(MicroInstructionId.AssignConst, [address]));
                instructions.push(new MicroInstruction(MicroInstructionId.AssignC));
                instructions.push(new MicroInstruction(MicroInstructionId.AssignConst, [value]));
                instructions.push(new MicroInstruction(MicroInstructionId.Store));
            }

            addresses = shuffleArray(addresses, faker);
            values = shuffleArray(values, faker);

            for (let i = 0; i < addresses.length; i++) {
                const address = addresses[i];
                const value = values[i];

                instructions.push(new MicroInstruction(MicroInstructionId.AssignConst, [address]));
                instructions.push(new MicroInstruction(MicroInstructionId.AssignC));
                instructions.push(new MicroInstruction(MicroInstructionId.AssignConst, [value]));
                instructions.push(new MicroInstruction(MicroInstructionId.Store));
            }

            instructions.push(halt);
            simulationTester.initialize(instructions);
            simulationTester.executeAllRam();
        } catch (e) {
            throw new Error(`Simulation failed: ${e}`);
        }
    });

    test('load', () => {
         try {
            let instructions: MicroInstruction[] = [new MicroInstruction(MicroInstructionId.Init)];

            addresses.forEach(address => {
                instructions.push(new MicroInstruction(MicroInstructionId.AssignConst, [address]));
                instructions.push(new MicroInstruction(MicroInstructionId.Load));
            });

            for (let i = 0; i < addresses.length; i++) {
                const address = addresses[i];
                const value = values[i];

                instructions.push(new MicroInstruction(MicroInstructionId.AssignConst, [address]));
                instructions.push(new MicroInstruction(MicroInstructionId.AssignC));
                instructions.push(new MicroInstruction(MicroInstructionId.AssignConst, [value]));
                instructions.push(new MicroInstruction(MicroInstructionId.Store));
            }

            addresses = shuffleArray(addresses, faker);
            values = shuffleArray(values, faker);

            addresses.forEach(address => {
                instructions.push(new MicroInstruction(MicroInstructionId.AssignConst, [address]));
                instructions.push(new MicroInstruction(MicroInstructionId.Load));
            });

            addresses = shuffleArray(addresses, faker).map(a => -a);

            addresses.forEach(address => {
                instructions.push(new MicroInstruction(MicroInstructionId.AssignConst, [address]));
                instructions.push(new MicroInstruction(MicroInstructionId.Load));
            });

            instructions.push(halt);
            simulationTester.initialize(instructions);
            simulationTester.executeAllRam();
        } catch (e) {
            throw new Error(`Simulation failed: ${e}`);
        }
    });
});

describe('arithmetic', () => {
    const operands = generatePairsWithRepetition(testNumbers);
    test('add', () => {
        testArithmetic(simulationTester, '+', operands);
    });

    test('sub', () => {
        testArithmetic(simulationTester, '-', operands);
    });

    test('mul', () => {
        testArithmetic(simulationTester, '*', operands);
    });

    test('div', () => {
        testArithmetic(simulationTester, '/', operands);
    });
});