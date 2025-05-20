import { SparseTape } from '../tape/sparse';
import { LinearTape } from '../tape/linear';
import { TapeSymbol } from '../tape/symbol';
import { TapeId } from './tape-id';
import { indexOfLeft, indexOfRight, logSeparator, twosComplementToInt } from '../../utils';
export class Machine {
    constructor() {
        this.tapes = [
            new SparseTape(TapeSymbol.Blank),
            new SparseTape(TapeSymbol.Blank),
            new SparseTape(TapeSymbol.Blank),
            new SparseTape(TapeSymbol.Blank),
            new SparseTape(TapeSymbol.Blank),
            new LinearTape(TapeSymbol.Blank),
            new LinearTape(TapeSymbol.Blank),
        ];
        this.state = "start";
    }
    getRegisterContents(tapeId) {
        if (tapeId > TapeId.T)
            throw new Error("The contents of memory cant be described as a list of numbers!");
        const [head, symbols] = this.tapes[tapeId].getFullContents(0);
        const left = indexOfLeft(symbols, TapeSymbol.End, head);
        const right = indexOfRight(symbols, TapeSymbol.End, head);
        return twosComplementToInt(symbols.slice(left + 1, right).join(""));
    }
    getIOTapeContents(tapeId) {
        if (tapeId !== TapeId.I && tapeId !== TapeId.O)
            throw new Error("The contents of memory cant be described as a list of numbers!");
        const [_, symbols] = this.tapes[tapeId].getFullContents(0);
        const endIndex = symbols.lastIndexOf(TapeSymbol.Separator);
        const rawNumbers = symbols.slice(0, endIndex).join("").split(TapeSymbol.Separator);
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
    executeTransition(stateInstructions) {
        for (const instruction of stateInstructions) {
            if (this.isSatisfied(instruction)) {
                let headReads = this.getHeadReads();
                logSeparator();
                console.log("State Before");
                this.logConfiguration();
                this.logTransition(instruction, headReads);
                for (let i = 0; i < instruction.actions.length; i++) {
                    const action = instruction.actions[i];
                    this.executeAction(i, action, headReads);
                }
                this.state = instruction.target;
                console.log("State After");
                this.logConfiguration();
                logSeparator();
                break;
            }
        }
    }
    formatTapeContents(tapeId, left, right) {
        const tape = this.tapes[tapeId];
        const contents = tape.getSegmentsAroundHead(left, right);
        const formatted = contents.map((value, index) => index === left ? `(${value})` : `${value}`);
        return `[${formatted.join(", ")}]`;
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
    getHeadReads() {
        let symbols = [];
        this.tapes.forEach((t) => { symbols.push(t.read() ?? TapeSymbol.Blank); });
        return symbols;
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
    getTransitionString(instruction, headReads) {
        return this.getLeft(headReads) + " = " + this.getRight(instruction, headReads);
    }
    reset() {
        this.tapes.forEach(t => t.reset());
        this.state = "start";
    }
}
