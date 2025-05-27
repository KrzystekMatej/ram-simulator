import { LinearTape } from '../tape/linear';
import {symbolToLatex, TapeSymbol} from '../tape/symbol';
import { Tape } from '../tape/tape';
import { TapeAction, Instruction, Instruction as TuringInstruction } from './instruction';
import { TapeId } from './tape-id';
import { indexOfLeft, indexOfRight } from '../../utils/collections';
import { twosComplementToInt } from '../../utils/parsing';
import { logSeparator } from '../../utils/logging';

export class Machine {
    tapes: Tape<TapeSymbol>[] = [
        new LinearTape(TapeSymbol.Blank),
        new LinearTape(TapeSymbol.Blank),
        new LinearTape(TapeSymbol.Blank),
        new LinearTape(TapeSymbol.Blank),
        new LinearTape(TapeSymbol.Blank),
        new LinearTape(TapeSymbol.Blank),
        new LinearTape(TapeSymbol.Blank),
    ];

    state: string = "halt";
    program: Map<string, Instruction[]> = new Map();
    currentInstruction: Instruction = Instruction.createNop("halt");

    getRegisterContents(tapeId: TapeId): number {
        if (tapeId > TapeId.T) throw new Error(`The contents of tape ${tapeId} can't be described as a number!`);
        const [head, symbols] = this.tapes[tapeId].getFullContents(0);

        const left = indexOfLeft(symbols, TapeSymbol.End, head);
        const right = indexOfRight(symbols, TapeSymbol.End, head);

        if (left === -1 || right === -1) return 0;

        return twosComplementToInt(symbols.slice(left + 1, right).join(""));
    }

    getIOTapeContents(tapeId: TapeId): number[] {
        if (tapeId !== TapeId.I && tapeId !== TapeId.O) throw new Error(`The contents of tape ${tapeId} can't be described as a list of numbers!`);
        const [_, symbols] = this.tapes[tapeId].getFullContents(0);
        const leftZero = symbols.indexOf(TapeSymbol.Zero);
        const leftOne = symbols.indexOf(TapeSymbol.One);
        let left: number;

        if (leftZero === -1) left = leftOne;
        else if (leftOne === -1) left = leftZero;
        else if (leftZero !== -1 && leftOne !== -1) left = Math.min(leftZero, leftOne);
        else return [];

        const right = symbols.lastIndexOf(TapeSymbol.Separator);

        if (right === -1) return [];

        const rawNumbers = symbols.slice(left, right).join("").split(TapeSymbol.Separator);
        let numbers: number[] = [];

        for (const raw of rawNumbers) {
            if (raw.length === 0) continue;
            numbers.push(twosComplementToInt(raw));
        }

        return numbers;
    }

    getMemoryContents(): Map<number, number> {
        const [head, symbols] = this.tapes[TapeId.M].getFullContents(0);

        const left = indexOfLeft(symbols, TapeSymbol.End, head);
        const right = indexOfRight(symbols, TapeSymbol.End, head);

        if (left === -1 || right === -1) return new Map();

        const rawMemory = symbols.slice(left + 1, right).join("");

        const rawEntries = rawMemory.split(TapeSymbol.Separator);
        let memory: Map<number, number> = new Map();

        for (const rawEntry of rawEntries) {
            if (rawEntry.length === 0) continue;
            const rawEntryParts = rawEntry.split(TapeSymbol.Colon);

            memory.set(twosComplementToInt(rawEntryParts[0]), twosComplementToInt(rawEntryParts[1]));
        }

        return memory;
    }

    initialize(initProgram: Map<string, Instruction[]>): void {
        this.reset();
        this.setProgram(initProgram);
        this.state = "0_start";
        this.currentInstruction = this.getSatisfied();
    }

    setProgram(program: Map<string, Instruction[]>): void {
        this.program.clear();
        program.forEach((value, key) => {
            this.program.set(key, value);
        });
    }

    executeProgram(): void {
        if (this.state.includes("halt")) return;

        while (!this.state.includes("halt")) {
            this.execute();
            if (this.currentInstruction.target.includes('start')) return;
            this.next();
        }
    }

    next(): Instruction {
        if (this.state.includes("halt")) return this.currentInstruction;

        this.state = this.currentInstruction.target;
        if (this.state.includes("error")) throw new Error(`Nastaven chybový stav: ${this.state}`);
        this.currentInstruction = this.getSatisfied();
        return this.currentInstruction;
    }

    getSatisfied(): Instruction {
        let stateInstructions: TuringInstruction[] = this.program.get(this.state) as TuringInstruction[];

        for (const instruction of stateInstructions) {
            if (this.isSatisfied(instruction)) {
                return instruction;
            }
        }

        throw new Error(`Nebyla nalezena vhodná instrukce pro podmínky pravidla: ${Instruction.getLeftString(this.state, this.getHeadReads())}!`);
    }

    isSatisfied(instruction: Instruction): boolean {

        for (let i = 0; i < instruction.conditions.length; i++) {
            const condition = instruction.conditions[i];
            const symbolOnTape = this.tapes[i].read();

            let satisfied = false;
            for (const allowed of condition.allowedSymbols) {
                if (allowed === TapeSymbol.Wildcard || allowed === symbolOnTape) {
                    satisfied = true;
                    break;
                }
            }
            if (!satisfied) return false;
        }

        return true;
    }

    execute(): void {
        if (this.state.includes('error')) throw new Error(`Nastaven chybový stav: ${this.state}`);
        let headReads = this.getHeadReads();

        for (let i = 0; i < this.currentInstruction.actions.length; i++) {
            const action = this.currentInstruction.actions[i];
            this.executeAction(i, action, headReads);
        }
    }

    executeAction(index: number, action: TapeAction, symbols: TapeSymbol[]): void {
        const tape = this.tapes[index];

        let symbolToWrite: TapeSymbol;

        if (action.write.type === 'literal') {
            symbolToWrite = action.write.symbol;
        } else if (action.write.type === 'fromTape') {
            symbolToWrite = symbols[action.write.sourceTape];
        } else throw new Error('Unknown symbol write type.');

        tape.write(symbolToWrite);
        tape.move(action.move);
    }

    formatTapeContents(tapeId: TapeId, left: number, right: number): string {
        const tape = this.tapes[tapeId];
        const contents = tape.getSegmentsAroundHead(left, right);

        const formatted = contents.map((value, index) =>
            index === left ? `(${value})` : `${value}`
        );

        return `[${formatted.join(", ")}]`;
    }

    getHeadReads() {
        let symbols: TapeSymbol[] = [];
        this.tapes.forEach((t) => { symbols.push(t.read() ?? TapeSymbol.Blank); });
        return symbols;
    }

    reset(): void {
        this.tapes.forEach(t => t.reset());
        this.state = "halt";
        this.program.clear();
    }

    logTransition(instruction: Instruction, headReads: TapeSymbol[]): void {
        logSeparator();
        console.log("Transition");
        console.log("General instruction:");
        console.log(instruction.toString(this.state));
        console.log("Concrete transition:");
        console.log(instruction.toStringTransition(this.state, headReads));
        logSeparator();
    }

    logConfiguration(): void {
        logSeparator();
        console.log("Configuration");
        console.log(`State: ${this.state}`);

        for (let i = 0; i < TapeId.TapeCount; i++) {
            const name = TapeId[i];
            const tape = this.tapes[i];
            console.log(`${name} = (contents: ${this.formatTapeContents(i, 10, 10)}, head: ${tape.tell()})`);
        }
        logSeparator();
    }
}
