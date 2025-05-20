import { InstructionId as RamInstructionId, Instruction as RamInstruction } from "../../core/micro-ram/instruction";
import { Machine as RamMachine } from "../../core/micro-ram/machine";
import { ToTuringTranspiler as RamToTuringTranspiler } from "../../core/micro-ram/to-turing-transpiler";
import { Machine as TuringMachine } from "../../core/turing/machine";
import { TapeId } from "../../core/turing/tape-id";
import { arraysEqual } from "../utils";
export class SimulationError extends Error {
    constructor(message) {
        super(message);
        this.name = "SimulationError";
    }
}
export class SimulationTester {
    constructor(turingSets) {
        this.ramMachine = new RamMachine();
        this.transpiler = new RamToTuringTranspiler();
        this.turingMachine = new TuringMachine();
        this.instructions = [];
        this.initialized = false;
        this.transpiler.initialize(turingSets);
    }
    initialize(instructions, inputs) {
        this.reset();
        this.instructions.push(...instructions);
        this.instructions.push(new RamInstruction(RamInstructionId.Halt, []));
        this.ramMachine.initInputs(inputs);
        this.executeTuringSet(this.transpiler.getInitializationSet(inputs), -1);
        this.initialized = true;
    }
    reset() {
        this.instructions.length = 0;
        this.ramMachine.reset();
        this.turingMachine.reset();
        this.initialized = false;
    }
    executeTuringSet(turingSet, ip) {
        RamToTuringTranspiler.logTuringSet(turingSet);
        while (true) {
            let stateInstructions = turingSet.get(this.turingMachine.state);
            this.turingMachine.executeTransition(stateInstructions);
            if ((this.turingMachine.state.includes("start") && this.turingMachine.state !== `${ip}_start`) || this.turingMachine.state === `${ip}_halt`) {
                break;
            }
        }
    }
    executeRamInstruction() {
        let ip = this.ramMachine.ip;
        this.ramMachine.execute(this.instructions[ip]);
        this.executeTuringSet(this.transpiler.transpile(this.instructions[ip], ip), ip);
    }
    areMachineStatesConsistent() {
        return this.turingMachine.getRegisterContents(TapeId.A) === this.ramMachine.A &&
            this.turingMachine.getRegisterContents(TapeId.B) === this.ramMachine.B &&
            this.turingMachine.getRegisterContents(TapeId.C) === this.ramMachine.C &&
            arraysEqual(this.turingMachine.getMemoryContents(), Array.from(this.ramMachine.memory.entries()), (x, y) => x[0] === y[0] && x[1] === y[1]) &&
            arraysEqual(this.turingMachine.getIOTapeContents(TapeId.I), this.ramMachine.input.getFullContents(0)[1]) &&
            arraysEqual(this.turingMachine.getIOTapeContents(TapeId.O), this.ramMachine.output.getFullContents(0)[1]);
    }
    executeAll() {
        if (!this.initialized)
            throw new SimulationError("Tester is not initialized!");
        while (true) {
            let num = this.ramMachine.ip;
            let instruction = this.instructions[num];
            console.log(`-------------------- Instruction ${num} -------------------`);
            this.executeRamInstruction();
            console.log(`-------------------- Instruction ${num} -------------------`);
            if (instruction.id === RamInstructionId.Halt) {
                this.initialized = false;
                return;
            }
            if (!this.areMachineStatesConsistent())
                throw new SimulationError(`Machine states are not consistent after instruction ${this.ramMachine.ip}: ${instruction.toString()}`);
        }
    }
}
