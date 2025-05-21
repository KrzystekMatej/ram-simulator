import * as path from 'path';
import * as fs from 'fs';
import {RamSimulator as SimulationTester} from "../../core/micro-ram/ram-simulator";
import {prepareTestNumbers, selectRandomFraction, shuffleArray} from "../helpers/environment-setup";
import {
    Instruction as MicroInstruction,
    InstructionId,
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
const halt = new  MicroInstruction(InstructionId.Halt);

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
    simulationTester.initialize([new MicroInstruction(InstructionId.Init, testNumbers), halt]);
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
                    new MicroInstruction(InstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    halt
                ]);
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
                    new MicroInstruction(InstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.AssignB),
                    halt
                ]);
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
                    new MicroInstruction(InstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.AssignC),
                    halt
                ]);
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
                    new MicroInstruction(InstructionId.Init, [number]),
                    new MicroInstruction(MicroInstructionId.Read),
                    halt
                ]);
                simulationTester.executeAll();
                expect(simulationTester.ramMachine.A).toBe(number);
            } catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });

    test('write', () => {
        try {
            let instructions: MicroInstruction[] = [new MicroInstruction(InstructionId.Init, testNumbers)];
            testNumbers.forEach(() => {
                instructions.push(new MicroInstruction(MicroInstructionId.Read));
                instructions.push(new MicroInstruction(MicroInstructionId.Write));
            });
            instructions.push(halt);
            simulationTester.initialize(instructions);
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
                new MicroInstruction(InstructionId.Init, testNumbers),
                new MicroInstruction(MicroInstructionId.Jump, [3]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [8]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [7]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                halt
            ]);
            simulationTester.executeAll();
            expect(simulationTester.ramMachine.A).toBe(0);
            expect(simulationTester.ramMachine.B).toBe(0);

            simulationTester.initialize([
                new MicroInstruction(InstructionId.Init, testNumbers),
                new MicroInstruction(MicroInstructionId.Jump, [2]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [8]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [7]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                halt
            ]);
            simulationTester.executeAll();
            expect(simulationTester.ramMachine.A).toBe(1);
            expect(simulationTester.ramMachine.B).toBe(0);

            simulationTester.initialize([
                new MicroInstruction(InstructionId.Init, testNumbers),
                new MicroInstruction(MicroInstructionId.Jump, [2]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [5]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [7]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                halt
            ]);
            simulationTester.executeAll();
            expect(simulationTester.ramMachine.A).toBe(0);
            expect(simulationTester.ramMachine.B).toBe(1);

            simulationTester.initialize([
                new MicroInstruction(InstructionId.Init, testNumbers),
                new MicroInstruction(MicroInstructionId.Jump, [2]),
                new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                new MicroInstruction(MicroInstructionId.Jump, [5]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.Jump, [8]),
                new MicroInstruction(MicroInstructionId.AssignConst, [0]),
                halt
            ]);
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
                    new MicroInstruction(InstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['==', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
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
                    new MicroInstruction(InstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['!=', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
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
                    new MicroInstruction(InstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['<=', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
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
                    new MicroInstruction(InstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['>=', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
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
                    new MicroInstruction(InstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['<', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
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
                    new MicroInstruction(InstructionId.Init),
                    new MicroInstruction(MicroInstructionId.AssignConst, [number]),
                    new MicroInstruction(MicroInstructionId.CondJump, ['>', 4]),
                    new MicroInstruction(MicroInstructionId.AssignConst, [1]),
                    halt
                ]);
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
            let instructions: MicroInstruction[] = [new MicroInstruction(InstructionId.Init)];
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
            simulationTester.executeAll();
        } catch (e) {
            throw new Error(`Simulation failed: ${e}`);
        }
    });

    test('load', () => {
         try {
            let instructions: MicroInstruction[] = [new MicroInstruction(InstructionId.Init)];

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
            simulationTester.executeAll();
        } catch (e) {
            throw new Error(`Simulation failed: ${e}`);
        }
    });
});

function testArithmetic(operator: string) {
    let a = shuffleArray(testNumbers, faker);
    let b = shuffleArray(testNumbers, faker);

    for (let i = 0; i < testNumbers.length; i++) {
        let result: number;

        switch (operator) {
            case "+":
                result = a[i] + b[i];
                break;
            case "-":
                result = a[i] - b[i];
                break;
            case "*":
                result = a[i] * b[i];
                break;
            case "/":
                result = intDiv(a[i], b[i]);
                break;
            default:
                throw new Error("This operator is not known.");
        }

        try {
            simulationTester.initialize([
                new MicroInstruction(InstructionId.Init),
                new MicroInstruction(MicroInstructionId.AssignConst, [a[i]]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.AssignConst, [b[i]]),
                new MicroInstruction(MicroInstructionId.Arithmetic, [operator]),
                halt
            ]);
            simulationTester.executeAll();

            expect(simulationTester.ramMachine.A).toBe(result);
        } catch (e) {
            throw new Error(`Simulation failed at input ${a[i]} ${operator} ${b[i]} = ${result}: ${e}`);
        }
    }
}

describe('arithmetic', () => {
    test('add', () => {
        //testArithmetic('+');
    });

    test('sub', () => {
        //testArithmetic('-');
    });

    test('mul', () => {
        //testArithmetic('*');
    });

    test('div', () => {
        //testArithmetic('/');
    });
});