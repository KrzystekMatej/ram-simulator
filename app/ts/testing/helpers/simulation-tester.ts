import { InstructionId as RamInstructionId, Instruction as RamInstruction } from "../../core/micro-ram/instruction";
import { Machine as RamMachine } from "../../core/micro-ram/machine";
import { ToTuringTranspiler as RamToTuringTranspiler } from "../../core/micro-ram/to-turing-transpiler";
import { Instruction as TuringInstruction } from "../../core/turing/instruction";
import { Machine as TuringMachine } from "../../core/turing/machine";
import { TapeId } from "../../core/turing/tape-id";
import { arraysEqual, mapsEqual } from "../../utils";

export class SimulationError extends Error {
    constructor(message: string) {
    super(message);
    this.name = "SimulationError";
    }
}

export class SimulationTester {
    ramMachine: RamMachine = new RamMachine();
    transpiler: RamToTuringTranspiler = new RamToTuringTranspiler();
    turingMachine: TuringMachine = new TuringMachine();
    instructions: RamInstruction[] = [];
    initialized: boolean = false;

    constructor(turingSets: string) {
        this.transpiler.initialize(turingSets);
    }

    initialize(instructions: RamInstruction[], inputs: number[]) : void {
        this.reset();

        this.instructions.push(...instructions);
        this.instructions.push(new RamInstruction(RamInstructionId.Halt, []));

        this.ramMachine.initInputs(inputs);
        this.executeTuringSet(this.transpiler.getInitializationSet(inputs), -1);
        this.initialized = true;
    }

    reset() : void {
        this.instructions.length = 0;
        this.ramMachine.reset();
        this.turingMachine.reset();
        this.initialized = false;
    }

    executeTuringSet(turingSet: Map<string, TuringInstruction[]>, ip: number): void {
        RamToTuringTranspiler.logTuringSet(turingSet);
        while (true) {
            let stateInstructions: TuringInstruction[] = turingSet.get(this.turingMachine.state) as TuringInstruction[];
            this.turingMachine.executeTransition(stateInstructions);
            if ((this.turingMachine.state.includes("start") && this.turingMachine.state !== `${ip}_start`) || this.turingMachine.state === `${ip}_halt`) {
                break;
            }
        }
    }

    executeRamInstruction() : void {
        let ip = this.ramMachine.ip;
        this.ramMachine.execute(this.instructions[ip]);
        this.executeTuringSet(this.transpiler.transpile(this.instructions[ip], ip), ip)
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
            let num = this.ramMachine.ip
            let instruction = this.instructions[num];

            console.log(`-------------------- Instruction ${num} -------------------`);
            this.executeRamInstruction();
            console.log(`-------------------- Instruction ${num} -------------------`);

             if (!this.areMachineStatesConsistent())
                throw new SimulationError(`Machine states are not consistent after instruction ${this.ramMachine.ip}: ${instruction.toString()}`);

            if (instruction.id === RamInstructionId.Halt) {
                this.initialized = false;
                return;
            }
        }
    }
}