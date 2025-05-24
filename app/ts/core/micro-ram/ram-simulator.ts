import { InstructionId as RamInstructionId, Instruction as RamInstruction } from "../../core/micro-ram/instruction";
import { Machine as RamMachine } from "../../core/micro-ram/machine";
import { ToTuringTranspiler as RamToTuringTranspiler } from "../../core/micro-ram/to-turing-transpiler";
import { Instruction as TuringInstruction } from "../../core/turing/instruction";
import { Machine as TuringMachine } from "../../core/turing/machine";
import {TapeId} from "../turing/tape-id";
import { arraysEqual, mapsEqual } from '../../utils/collections';
import { prefixMethodErrors } from '../../utils/error-handling';
import { logSeparator } from '../../utils/logging';

export class RamSimulator {
    ramMachine: RamMachine = new RamMachine();
    transpiler: RamToTuringTranspiler = new RamToTuringTranspiler();
    turingMachine: TuringMachine = new TuringMachine();
    initialized: boolean = false;
    checkConsistency: boolean = false;
    verbose: boolean = false;

    constructor(turingSets: string, checkConsistency: boolean = false, verbose: boolean = false) {
        prefixMethodErrors("RAM to turing transpiler error: ", this.transpiler.initialize, this.transpiler, turingSets);
        this.checkConsistency = checkConsistency;
        this.verbose = verbose;
    }

    initialize(instructions: RamInstruction[]) : void {
        this.ramMachine.initialize(instructions);
        this.turingMachine.initialize(this.transpiler.transpile(this.ramMachine.currentInstruction, this.ramMachine.ip));
        this.initialized = true;
    }

    ramStep(executeTuring: boolean = true) : RamInstruction {
        if (!this.initialized) throw new Error("Simulation error: Uninitialized!");

        prefixMethodErrors("RAM machine error: ", this.ramMachine.execute, this.ramMachine);
        if (executeTuring) prefixMethodErrors("Turing machine error: ", this.turingMachine.executeProgram, this.turingMachine);

        const instruction = prefixMethodErrors("RAM machine error: ", this.ramMachine.next, this.ramMachine);

        if (this.verbose)
        {
            console.log("Micro ram instruction");
            console.log(instruction.toString());
        }

        this.turingMachine.setProgram(this.transpiler.transpile(instruction, this.ramMachine.ip));
        prefixMethodErrors("Turing machine error: ", this.turingMachine.next, this.turingMachine);

        if (this.checkConsistency && !this.areMachineStatesConsistent())
            throw new Error(`Simulation error: Machine states are not consistent after instruction ${this.ramMachine.ip}: ${instruction.toString()}`);

        return instruction;
    }

    turingStep() : TuringInstruction {
        if (!this.initialized) throw new Error("Simulation error: Uninitialized!");

        prefixMethodErrors("Turing machine error: ", this.turingMachine.execute, this.turingMachine);

        if (this.turingMachine.currentInstruction.target.includes("start")) {
            this.ramStep(false);
            return this.turingMachine.currentInstruction;
        }

        return prefixMethodErrors("Turing machine error: ", this.turingMachine.next, this.turingMachine);
    }

    areMachineStatesConsistent() : boolean {
        return (this.turingMachine.state === `${this.ramMachine.ip}_start` || (this.turingMachine.state.includes("halt") && this.ramMachine.currentInstruction.id === RamInstructionId.Halt)) &&
            this.turingMachine.getRegisterContents(TapeId.A) === this.ramMachine.A &&
            this.turingMachine.getRegisterContents(TapeId.B) === this.ramMachine.B &&
            this.turingMachine.getRegisterContents(TapeId.C) === this.ramMachine.C &&
            mapsEqual(this.turingMachine.getMemoryContents(), this.ramMachine.memory) &&
            arraysEqual(this.turingMachine.getIOTapeContents(TapeId.I), this.ramMachine.input.getFullContents(0)[1] as number[]) &&
            arraysEqual(this.turingMachine.getIOTapeContents(TapeId.O), this.ramMachine.output.getFullContents(0)[1] as number[]);
    }

    executeAllRam() : void {
        if (!this.initialized) throw new Error("Simulation error: Uninitialized!");

        while (true) {
            const instruction = this.ramStep();

            if (instruction.id === RamInstructionId.Halt || this.ramMachine.ip >= this.ramMachine.program.length) {
                this.initialized = false;
                return;
            }
        }
    }

    executeAllTuring(): void {
        if (!this.initialized) throw new Error("Simulation error: Uninitialized!");

        while (true) {
            const instruction = this.turingStep();

            if (this.verbose)
            {
                logSeparator();
                console.log("State");
                this.turingMachine.logConfiguration();
                logSeparator();
                console.log("Next instruction");
                console.log(instruction.toString(this.turingMachine.state));
            }

            if (instruction.target.includes('halt') || this.ramMachine.ip >= this.ramMachine.program.length) {
                this.initialized = false;
                return;
            }
        }
    }
}