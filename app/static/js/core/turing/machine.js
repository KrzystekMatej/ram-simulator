import { LinearTape } from '../tape/linear.js';
import { TapeSymbol } from '../tape/symbol.js';
import { Instruction } from './instruction.js';
import { TapeId } from './tape-id.js';
import { indexOfLeft, indexOfRight } from '../../utils/collections.js';
import { twosComplementToInt } from '../../utils/parsing.js';
import { logSeparator } from '../../utils/logging.js';
export class Machine {
    constructor() {
        this.tapes = [
            new LinearTape(TapeSymbol.Blank),
            new LinearTape(TapeSymbol.Blank),
            new LinearTape(TapeSymbol.Blank),
            new LinearTape(TapeSymbol.Blank),
            new LinearTape(TapeSymbol.Blank),
            new LinearTape(TapeSymbol.Blank),
            new LinearTape(TapeSymbol.Blank),
        ];
        this.state = "halt";
        this.program = new Map();
        this.currentInstruction = Instruction.createNop("halt");
    }
    getRegisterContents(tapeId) {
        if (tapeId > TapeId.T)
            throw new Error(`The contents of tape ${tapeId} can't be described as a number!`);
        const [head, symbols] = this.tapes[tapeId].getFullContents(0);
        const left = indexOfLeft(symbols, TapeSymbol.End, head);
        const right = indexOfRight(symbols, TapeSymbol.End, head);
        if (left === -1 || right === -1)
            return 0;
        return twosComplementToInt(symbols.slice(left + 1, right).join(""));
    }
    getIOTapeContents(tapeId) {
        if (tapeId !== TapeId.I && tapeId !== TapeId.O)
            throw new Error(`The contents of tape ${tapeId} can't be described as a list of numbers!`);
        const [_, symbols] = this.tapes[tapeId].getFullContents(0);
        const leftZero = symbols.indexOf(TapeSymbol.Zero);
        const leftOne = symbols.indexOf(TapeSymbol.One);
        let left;
        if (leftZero === -1)
            left = leftOne;
        else if (leftOne === -1)
            left = leftZero;
        else if (leftZero !== -1 && leftOne !== -1)
            left = Math.min(leftZero, leftOne);
        else
            return [];
        const right = symbols.lastIndexOf(TapeSymbol.Separator);
        if (right === -1)
            return [];
        const rawNumbers = symbols.slice(left, right).join("").split(TapeSymbol.Separator);
        let numbers = [];
        for (const raw of rawNumbers) {
            if (raw.length === 0)
                continue;
            numbers.push(twosComplementToInt(raw));
        }
        return numbers;
    }
    getMemoryContents() {
        const [head, symbols] = this.tapes[TapeId.M].getFullContents(0);
        const left = indexOfLeft(symbols, TapeSymbol.End, head);
        const right = indexOfRight(symbols, TapeSymbol.End, head);
        if (left === -1 || right === -1)
            return new Map();
        const rawMemory = symbols.slice(left + 1, right).join("");
        const rawEntries = rawMemory.split(TapeSymbol.Separator);
        let memory = new Map();
        for (const rawEntry of rawEntries) {
            if (rawEntry.length === 0)
                continue;
            const rawEntryParts = rawEntry.split(TapeSymbol.Colon);
            memory.set(twosComplementToInt(rawEntryParts[0]), twosComplementToInt(rawEntryParts[1]));
        }
        return memory;
    }
    initialize(initProgram) {
        this.reset();
        this.setProgram(initProgram);
        this.state = "0_start";
        this.currentInstruction = this.getSatisfied();
    }
    setProgram(program) {
        this.program.clear();
        program.forEach((value, key) => {
            this.program.set(key, value);
        });
    }
    executeProgram() {
        if (this.state.includes("halt"))
            return;
        while (!this.state.includes("halt")) {
            this.execute();
            if (this.currentInstruction.target.includes('start'))
                return;
            this.next();
        }
    }
    next() {
        if (this.state.includes("halt"))
            return this.currentInstruction;
        this.state = this.currentInstruction.target;
        if (this.state.includes("error"))
            throw new Error(`Transitioning to error state: ${this.state}`);
        this.currentInstruction = this.getSatisfied();
        return this.currentInstruction;
    }
    getSatisfied() {
        let stateInstructions = this.program.get(this.state);
        for (const instruction of stateInstructions) {
            if (this.isSatisfied(instruction)) {
                return instruction;
            }
        }
        throw new Error(`No suitable instruction found for ${this.getLeft(this.getHeadReads())}!`);
    }
    isSatisfied(instruction) {
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
            if (!satisfied)
                return false;
        }
        return true;
    }
    execute() {
        let headReads = this.getHeadReads();
        for (let i = 0; i < this.currentInstruction.actions.length; i++) {
            const action = this.currentInstruction.actions[i];
            this.executeAction(i, action, headReads);
        }
    }
    executeAction(index, action, symbols) {
        const tape = this.tapes[index];
        let symbolToWrite;
        if (action.write.type === 'literal') {
            symbolToWrite = action.write.symbol;
        }
        else if (action.write.type === 'fromTape') {
            symbolToWrite = symbols[action.write.sourceTape];
        }
        else {
            throw new Error('Unknown symbol write type.');
        }
        tape.write(symbolToWrite);
        tape.move(action.move);
    }
    formatTapeContents(tapeId, left, right) {
        const tape = this.tapes[tapeId];
        const contents = tape.getSegmentsAroundHead(left, right);
        const formatted = contents.map((value, index) => index === left ? `(${value})` : `${value}`);
        return `[${formatted.join(", ")}]`;
    }
    getHeadReads() {
        let symbols = [];
        this.tapes.forEach((t) => { symbols.push(t.read() ?? TapeSymbol.Blank); });
        return symbols;
    }
    reset() {
        this.tapes.forEach(t => t.reset());
        this.state = "halt";
        this.program.clear();
    }
    logTransition(instruction, headReads) {
        logSeparator();
        console.log("Transition");
        console.log("General instruction:");
        console.log(instruction.toString(this.state));
        console.log("Concrete transition:");
        console.log(this.getTransitionString(instruction, headReads));
        logSeparator();
    }
    logConfiguration() {
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
    getTransitionString(instruction, headReads) {
        return this.getLeft(headReads) + " = " + this.getRight(instruction, headReads);
    }
    getLeft(headReads) {
        const conds = Array.from({ length: TapeId.TapeCount }, (_, i) => {
            const name = TapeId[i];
            return `${name}(${headReads[i]})`;
        });
        return `(${this.state}, ${conds.join(", ")})`;
    }
    getRight(instruction, headReads) {
        let actions = instruction.actions;
        const acts = Array.from({ length: TapeId.TapeCount }, (_, i) => {
            const name = TapeId[i];
            let symbolToWrite;
            if (actions[i].write.type === 'literal') {
                symbolToWrite = actions[i].write.symbol;
            }
            else if (actions[i].write.type === 'fromTape') {
                symbolToWrite = headReads[actions[i].write.sourceTape];
            }
            else {
                throw new Error('Unknown symbol write type.');
            }
            return `${name}(${symbolToWrite}, ${actions[i].move})`;
        });
        return `(${instruction.target}, ${acts.join(", ")})`;
    }
}
