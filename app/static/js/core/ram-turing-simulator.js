import { InstructionId as RamInstructionId } from "./micro-ram/instruction.js";
import { Machine as RamMachine } from "./micro-ram/machine.js";
import { ToTuringTranspiler as RamToTuringTranspiler } from "./micro-ram/to-turing-transpiler.js";
import { Machine as TuringMachine } from "./turing/machine.js";
import { TapeId } from "./turing/tape-id.js";
import { arraysEqual, mapsEqual } from '../utils/collections.js';
import { prefixMethodErrors } from '../utils/error-handling.js';
import { logSeparator } from '../utils/logging.js';
export class RamTuringSimulator {
    constructor(turingSets, checkConsistency = false, verbose = false) {
        this.ramMachine = new RamMachine();
        this.transpiler = new RamToTuringTranspiler();
        this.turingMachine = new TuringMachine();
        this.initialized = false;
        this.checkConsistency = false;
        this.verbose = false;
        prefixMethodErrors("Chyba RAM-Turing transpilátoru: ", this.transpiler.initialize, this.transpiler, turingSets);
        this.checkConsistency = checkConsistency;
        this.verbose = verbose;
    }
    initialize(instructions) {
        this.ramMachine.initialize(instructions);
        this.turingMachine.initialize(this.transpiler.transpile(this.ramMachine.currentInstruction, this.ramMachine.ip));
        this.initialized = true;
    }
    ramStep(executeTuring = true) {
        if (!this.initialized)
            throw new Error("Stroje nejsou inicializovány je nutno vložit program.");
        if (this.isFinished())
            throw new Error("Program byl již ukončen - nelze pokračovat.");
        prefixMethodErrors("Chyba stroje RAM: ", this.ramMachine.execute, this.ramMachine);
        if (executeTuring)
            prefixMethodErrors("Chyba turingova stroje: ", this.turingMachine.executeProgram, this.turingMachine);
        const instruction = prefixMethodErrors("Chyba stroje RAM: ", this.ramMachine.next, this.ramMachine);
        if (this.verbose) {
            console.log("Micro ram instruction");
            console.log(instruction.toString());
        }
        this.turingMachine.setProgram(this.transpiler.transpile(instruction, this.ramMachine.ip));
        prefixMethodErrors("Chyba turingova stroje: ", this.turingMachine.next, this.turingMachine);
        if (this.checkConsistency && !this.areMachineStatesConsistent())
            throw new Error(`Chyba simulace: stavy strojů nejsou konzistentní po uskutečnění instrukce č. ${this.ramMachine.ip}: ${instruction.toString()}`);
        return instruction;
    }
    turingStep() {
        if (!this.initialized)
            throw new Error("Stroje nejsou inicializovány je nutno vložit program");
        if (this.isFinished())
            throw new Error("Program byl již ukončen - nelze pokračovat.");
        prefixMethodErrors("Chyba turingova stroje: ", this.turingMachine.execute, this.turingMachine);
        if (this.turingMachine.currentInstruction.target.includes("start")) {
            this.ramStep(false);
            return this.turingMachine.currentInstruction;
        }
        return prefixMethodErrors("Chyba turingova stroje: ", this.turingMachine.next, this.turingMachine);
    }
    areMachineStatesConsistent() {
        return (this.turingMachine.state === `${this.ramMachine.ip}_start` || (this.turingMachine.state.includes("halt") && this.ramMachine.currentInstruction.id === RamInstructionId.Halt)) &&
            this.turingMachine.getRegisterContents(TapeId.A) === this.ramMachine.A &&
            this.turingMachine.getRegisterContents(TapeId.B) === this.ramMachine.B &&
            this.turingMachine.getRegisterContents(TapeId.C) === this.ramMachine.C &&
            mapsEqual(this.turingMachine.getMemoryContents(), this.ramMachine.memory) &&
            arraysEqual(this.turingMachine.getIOTapeContents(TapeId.I), this.ramMachine.input.getFullContents(0)[1]) &&
            arraysEqual(this.turingMachine.getIOTapeContents(TapeId.O), this.ramMachine.output.getFullContents(0)[1]);
    }
    executeAllRam() {
        if (!this.initialized)
            throw new Error("Stroje nejsou inicializovány je nutno vložit program");
        while (true) {
            const instruction = this.ramStep();
            if (instruction.id === RamInstructionId.Halt || this.ramMachine.ip >= this.ramMachine.program.length) {
                this.initialized = false;
                return;
            }
        }
    }
    executeAllTuring() {
        if (!this.initialized)
            throw new Error("Stroje nejsou inicializovány je nutno vložit program");
        while (true) {
            const instruction = this.turingStep();
            if (this.verbose) {
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
    reset() {
        this.ramMachine.reset();
        this.turingMachine.reset();
        this.initialized = false;
    }
    isFinished() {
        return this.turingMachine.state.includes('halt')
            || this.ramMachine.ip >= this.ramMachine.program.length
            || this.ramMachine.currentInstruction.id === RamInstructionId.Halt;
    }
}
