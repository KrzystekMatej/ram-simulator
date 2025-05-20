import * as path from 'path';
import * as fs from 'fs';
import { SimulationTester } from "../helpers/simulation-tester";
import {prepareTestNumbers, selectRandomFraction, shuffleArray} from "../helpers/environment-setup";
import {Instruction as MicroInstruction, InstructionId as MicroInstructionId} from "../../core/micro-ram/instruction";
import { arraysEqual } from "../../utils";
import { Faker, cs_CZ } from '@faker-js/faker';

const originalConsoleLog = console.log;
console.log = () => {};

const faker = new Faker({
  locale: cs_CZ,
  seed: 42
});

const testNumbers = prepareTestNumbers();
let simulationTester: SimulationTester;

beforeAll(() => {
    const sets = fs.readFileSync(
        path.join(__dirname, '../../../assets/turing_sets.txt'),
        'utf-8'
    );
    simulationTester = new SimulationTester(sets);
});

afterAll(() => {
    console.log = originalConsoleLog;
});

test('init', () => {
    simulationTester.initialize([], testNumbers);
    simulationTester.executeAll();
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
                    new MicroInstruction(MicroInstructionId.AssignConst, [number])
                ], []);
                simulationTester.executeAll();
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
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.AssignB)
                ], []);
                simulationTester.executeAll();
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
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.AssignC)
                ], []);
                simulationTester.executeAll();
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
                    new MicroInstruction(MicroInstructionId.Read)
                ], [number]);
                simulationTester.executeAll();
                expect(simulationTester.ramMachine.A).toBe(number);
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });

    test('write', () => {
        try {
            let instructions: MicroInstruction[] = [];
            testNumbers.forEach(() => {
                instructions.push(new MicroInstruction(MicroInstructionId.Read));
                instructions.push(new MicroInstruction(MicroInstructionId.Write));
            });
            simulationTester.initialize(instructions, testNumbers);
            simulationTester.executeAll();
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
               new MicroInstruction(MicroInstructionId.Jump, [2]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [7]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [6]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
            ], testNumbers);
            simulationTester.executeAll();
            expect(simulationTester.ramMachine.A).toBe(0);
            expect(simulationTester.ramMachine.B).toBe(0);

            simulationTester.initialize([
                new MicroInstruction(MicroInstructionId.Jump, [1]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [7]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [6]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
            ], testNumbers);
            simulationTester.executeAll();
            expect(simulationTester.ramMachine.A).toBe(1);
            expect(simulationTester.ramMachine.B).toBe(0);

            simulationTester.initialize([
                new MicroInstruction(MicroInstructionId.Jump, [1]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [4]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [6]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
            ], testNumbers);
            simulationTester.executeAll();
            expect(simulationTester.ramMachine.A).toBe(0);
            expect(simulationTester.ramMachine.B).toBe(1);

            simulationTester.initialize([
                new MicroInstruction(MicroInstructionId.Jump, [1]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [4]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [7]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
            ], testNumbers);
            simulationTester.executeAll();
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
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['==', 3]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1])
                ], []);
                simulationTester.executeAll();
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
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['!=', 3]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1])
                ], []);
                simulationTester.executeAll();
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
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['<=', 3]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1])
                ], []);
                simulationTester.executeAll();
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
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['>=', 3]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1])
                ], []);
                simulationTester.executeAll();
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
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['<', 3]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1])
                ], []);
                simulationTester.executeAll();
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
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['>', 3]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1])
                ], []);
                simulationTester.executeAll();
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
            let instructions: MicroInstruction[] = [];
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

            simulationTester.initialize(instructions, []);
            simulationTester.executeAll();
        } catch (e) {
            throw new Error(`Simulation failed: ${e}`);
        }
    });

    test('load', () => {
         try {
            let instructions: MicroInstruction[] = [];

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

            simulationTester.initialize(instructions, []);
            simulationTester.executeAll();
        } catch (e) {
            throw new Error(`Simulation failed: ${e}`);
        }
    });
});