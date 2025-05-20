import * as path from 'path';
import * as fs from 'fs';
import { SimulationTester } from "../utils/testing/simulation-tester";
import { prepareTestNumbers } from "../utils/testing/helper-functions";
import { Instruction as MicroInstruction, InstructionId as MicroInstructionId } from "../core/micro-ram/instruction";
import { arraysEqual } from "../utils/utils";
const originalConsoleLog = console.log;
console.log = () => { };
const testNumbers = prepareTestNumbers();
let simulationTester;
beforeAll(() => {
    const sets = fs.readFileSync(path.join(__dirname, '../../assets/turing_sets.txt'), 'utf-8');
    simulationTester = new SimulationTester(sets);
});
afterAll(() => {
    console.log = originalConsoleLog;
});
describe('assignment', () => {
    test('const', () => {
        for (const number of testNumbers) {
            try {
                simulationTester.initialize([
                    new MicroInstruction(MicroInstructionId.AssignConst, [number])
                ], []);
                simulationTester.executeAll();
                expect(simulationTester.ramMachine.A).toBe(number);
            }
            catch (e) {
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
                expect(simulationTester.ramMachine.A).toBe(number);
                expect(simulationTester.ramMachine.B).toBe(number);
            }
            catch (e) {
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
                expect(simulationTester.ramMachine.A).toBe(number);
                expect(simulationTester.ramMachine.C).toBe(number);
            }
            catch (e) {
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
                expect(arraysEqual(simulationTester.ramMachine.input.getFullContents(0)[1], [number])).toBe(true);
                simulationTester.executeAll();
                expect(simulationTester.ramMachine.A).toBe(number);
            }
            catch (e) {
                throw new Error(`Simulation failed at input ${number}: ${e}`);
            }
        }
    });
    test('write', () => {
        try {
            let instructions = [];
            testNumbers.forEach(() => {
                instructions.push(new MicroInstruction(MicroInstructionId.Read));
                instructions.push(new MicroInstruction(MicroInstructionId.Write));
            });
            simulationTester.initialize(instructions, testNumbers);
            expect(arraysEqual(simulationTester.ramMachine.input.getFullContents(0)[1], testNumbers)).toBe(true);
            simulationTester.executeAll();
            expect(arraysEqual(simulationTester.ramMachine.output.getFullContents(0)[1], testNumbers)).toBe(true);
        }
        catch (e) {
            throw new Error(`Simulation failed: ${e}`);
        }
    });
});
