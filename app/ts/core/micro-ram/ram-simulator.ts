import { InstructionId as RamInstructionId, Instruction as RamInstruction } from "../../core/micro-ram/instruction";
import { Machine as RamMachine } from "../../core/micro-ram/machine";
import { ToTuringTranspiler as RamToTuringTranspiler } from "../../core/micro-ram/to-turing-transpiler";
import { Instruction as TuringInstruction } from "../../core/turing/instruction";
import { Machine as TuringMachine } from "../../core/turing/machine";
import {TapeId} from "../turing/tape-id";
import {arraysEqual, mapsEqual} from "../../utils";

export class SimulationError extends Error {
    constructor(message: string) {
    super(message);
    this.name = "SimulationError";
    }
}

export class RamSimulator {
    ramMachine: RamMachine = new RamMachine();
    transpiler: RamToTuringTranspiler = new RamToTuringTranspiler();
    turingMachine: TuringMachine = new TuringMachine();
    initialized: boolean = false;
    checkConsistency: boolean = false;

    constructor(turingSets: string, checkConsistency: boolean = false) {
        this.transpiler.initialize(turingSets);
        this.checkConsistency = checkConsistency;
    }

    initialize(instructions: RamInstruction[]) : void {
        this.ramMachine.initialize(instructions);
        this.turingMachine.initialize(this.transpiler.transpile(this.ramMachine.current, this.ramMachine.ip));
        this.initialized = true;
    }

    ramStep(executeTuring: boolean = true) : RamInstruction {
        if (!this.initialized) throw new SimulationError("Tester is not initialized!");

        this.ramMachine.execute();
        if (executeTuring) this.turingMachine.executeProgram();

        const instruction = this.ramMachine.next();
        this.turingMachine.setProgram(this.transpiler.transpile(instruction, this.ramMachine.ip));
        this.turingMachine.next();
        return instruction;
    }

    turingStep() : TuringInstruction {
        if (!this.initialized) throw new SimulationError("Tester is not initialized!");

        this.turingMachine.execute();

        if (this.turingMachine.current.target.includes("start")) {
            this.ramStep(false);
            return this.turingMachine.current;
        }

        return this.turingMachine.next();
    }

    areMachineStatesConsistent() : boolean {
        return (this.turingMachine.state === `${this.ramMachine.ip}_start` || (this.turingMachine.state.includes("halt") && this.ramMachine.ip === -1)) &&
            this.turingMachine.getRegisterContents(TapeId.A) === this.ramMachine.A &&
            this.turingMachine.getRegisterContents(TapeId.B) === this.ramMachine.B &&
            this.turingMachine.getRegisterContents(TapeId.C) === this.ramMachine.C &&
            mapsEqual(this.turingMachine.getMemoryContents(), this.ramMachine.memory) &&
            arraysEqual(this.turingMachine.getIOTapeContents(TapeId.I), this.ramMachine.input.getFullContents(0)[1] as number[]) &&
            arraysEqual(this.turingMachine.getIOTapeContents(TapeId.O), this.ramMachine.output.getFullContents(0)[1] as number[]);
    }

    executeAll() : void {
        if (!this.initialized) throw new SimulationError("Tester is not initialized!");

        while (true) {
            const instruction = this.ramStep();

            if (this.checkConsistency && !this.areMachineStatesConsistent())
                throw new SimulationError(`Machine states are not consistent after instruction ${this.ramMachine.ip}: ${instruction.toString()}`);

            if (instruction.id === RamInstructionId.Halt || this.ramMachine.ip >= this.ramMachine.program.length) {
                this.initialized = false;
                return;
            }
        }
    }
}