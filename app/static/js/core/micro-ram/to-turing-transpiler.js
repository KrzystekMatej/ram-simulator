import { TapeCondition, TapeAction, Instruction as TuringInstruction } from '../turing/instruction.js';
import { Move } from '../tape/move.js';
import { TapeSymbol } from '../tape/symbol.js';
import { TapeId } from '../turing/tape-id.js';
import { IntToMinimalTwosComplement } from '../../utils/parsing.js';
import { logSeparator } from '../../utils/logging.js';
const cond = (tape, ...symbols) => [tape, TapeCondition.multiple(symbols)];
const tapeAct = (target, source, move) => [target, TapeAction.fromTape(source, move)];
const litAct = (tape, symbol, move) => [tape, TapeAction.fromLiteral(symbol, move)];
export class ToTuringTranspiler {
    constructor() {
        this.instructionMap = new Map();
    }
    initialize(text) {
        let currentInstruction = null;
        let currentMap = null;
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const line = rawLine.trim();
            if (line.length === 0)
                continue;
            if (line.startsWith('instruction:')) {
                currentInstruction = line.split(':')[1].trim();
                currentMap = new Map();
                this.instructionMap.set(currentInstruction, currentMap);
            }
            else if (currentInstruction && currentMap) {
                try {
                    const [source, instruction] = TuringInstruction.fromString(line);
                    if (!currentMap.has(source)) {
                        currentMap.set(source, []);
                    }
                    currentMap.get(source).push(instruction);
                }
                catch (error) {
                    throw new Error(`Error at line ${i + 1}: "${rawLine}"\n${String(error)}`);
                }
            }
            else {
                throw new Error(`Unexpected line outside of instruction block at line ${i + 1}: "${rawLine}"`);
            }
        }
    }
    getTuringSet(instructionCode) {
        return new Map(Array.from(this.instructionMap.get(instructionCode).entries(), ([key, value]) => [
            key,
            value.map(instr => new TuringInstruction(instr.target, instr.conditions, instr.actions))
        ]));
    }
    static logTuringSet(turingSet) {
        logSeparator();
        console.log("Turing Set:");
        for (const [state, instructions] of turingSet.entries()) {
            for (const instr of instructions) {
                console.log(instr.toString(state));
            }
        }
        logSeparator();
    }
    static specifyGotoLabel(turingSet, label) {
        const entries = Array.from(turingSet.entries());
        for (const [_, instructions] of entries) {
            instructions.forEach((turingInstruction) => {
                if (turingInstruction.target === 'goto_label') {
                    turingInstruction.target = `goto_${label}`;
                }
            });
        }
    }
    getInitializationSet(inputs) {
        let turingSet = this.getTuringSet('init');
        if (inputs.length <= 0) {
            turingSet.set('input', [TuringInstruction.createNop('next')]);
            return turingSet;
        }
        turingSet.set('input', [TuringInstruction.createNop('input_0_0')]);
        inputs.forEach((value, index) => {
            const twosComplement = IntToMinimalTwosComplement(value);
            for (let i = 0; i < twosComplement.length; i++) {
                let write = litAct(TapeId.I, twosComplement[i], Move.Right);
                turingSet.set(`input_${index}_${i}`, [TuringInstruction.createFromOrderedEntries(`input_${index}_${i + 1}`, [], [write])]);
            }
            let next = `input_${index + 1}_0`;
            let write = litAct(TapeId.I, TapeSymbol.Separator, Move.Right);
            if (index === inputs.length - 1) {
                next = `left_shift`;
                write = litAct(TapeId.I, TapeSymbol.Separator, Move.Left);
            }
            turingSet.set(`input_${index}_${twosComplement.length}`, [TuringInstruction.createFromOrderedEntries(next, [], [write])]);
        });
        turingSet.set('left_shift', [
            TuringInstruction.createFromOrderedEntries('left_shift', [cond(TapeId.I, TapeSymbol.Zero, TapeSymbol.One, TapeSymbol.Separator)], [tapeAct(TapeId.I, TapeId.I, Move.Left)]),
            TuringInstruction.createFromOrderedEntries('next', [cond(TapeId.I, TapeSymbol.Blank)], [tapeAct(TapeId.I, TapeId.I, Move.Right)])
        ]);
        return turingSet;
    }
    transpile(ramInstruction, ip) {
        let turingSet = ToTuringTranspiler.handlers[ramInstruction.id].apply(this, ramInstruction.args);
        const entries = Array.from(turingSet.entries());
        for (const [source_state, instructions] of entries) {
            turingSet.delete(source_state);
            let newKey;
            const gotoMatch = source_state.match(/^goto_(\d+)$/);
            if (source_state === "next") {
                newKey = `${ip + 1}_start`;
            }
            else if (gotoMatch) {
                newKey = `${gotoMatch[1]}_start`;
            }
            else {
                newKey = `${ip}_${source_state}`;
            }
            turingSet.set(newKey, instructions);
            instructions.forEach((turingInstruction) => {
                const target = turingInstruction.target;
                const targetGotoMatch = target.match(/^goto_(\d+)$/);
                if (target === "next") {
                    turingInstruction.target = `${ip + 1}_start`;
                }
                else if (targetGotoMatch) {
                    turingInstruction.target = `${targetGotoMatch[1]}_start`;
                }
                else {
                    turingInstruction.target = `${ip}_${target}`;
                }
            });
        }
        return turingSet;
    }
}
ToTuringTranspiler.handlers = [
    function init(...inputs) {
        return this.getInitializationSet(inputs);
    },
    function assignConst(constant) {
        let turingSet = new Map();
        const twosComplement = IntToMinimalTwosComplement(constant);
        turingSet.set('start', [TuringInstruction.createNop('left_shift_a')]);
        turingSet.set('left_shift_a', [
            TuringInstruction.createFromOrderedEntries('left_shift_a', [cond(TapeId.A, TapeSymbol.Zero, TapeSymbol.One)], [tapeAct(TapeId.A, TapeId.A, Move.Right)]),
            TuringInstruction.createFromOrderedEntries('write_0', [cond(TapeId.A, TapeSymbol.End)], [litAct(TapeId.A, TapeSymbol.End, Move.Right)])
        ]);
        for (let i = 0; i < twosComplement.length; i++) {
            let write = litAct(TapeId.A, twosComplement[i], Move.Right);
            turingSet.set(`write_${i}`, [TuringInstruction.createFromOrderedEntries(`write_${i + 1}`, [], [write])]);
        }
        turingSet.set(`write_${twosComplement.length}`, [TuringInstruction.createFromOrderedEntries('next', [], [litAct(TapeId.A, TapeSymbol.End, Move.Left)])]);
        return turingSet;
    },
    function assignB() {
        return this.getTuringSet('assign_b');
    },
    function assignC() {
        return this.getTuringSet('assign_c');
    },
    function load() {
        return this.getTuringSet('load');
    },
    function store() {
        return this.getTuringSet('store');
    },
    function arithmetic(op) {
        switch (op) {
            case '+':
                return this.getTuringSet('add');
            case '-':
                return this.getTuringSet('sub');
            case '*':
                return this.getTuringSet('mul');
            case '/':
                return this.getTuringSet('div');
            default:
                throw new Error(`Unknown arithmetic operation ${op}`);
        }
    },
    function jump(label) {
        let turingSet = this.getTuringSet('jmp');
        ToTuringTranspiler.specifyGotoLabel(turingSet, label);
        return turingSet;
    },
    function condJump(rel, label) {
        let turingSet;
        switch (rel) {
            case '==':
                turingSet = this.getTuringSet('je');
                ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                return turingSet;
            case '!=':
                turingSet = this.getTuringSet('jne');
                ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                return turingSet;
            case '<=':
                turingSet = this.getTuringSet('jle');
                ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                return turingSet;
            case '>=':
                turingSet = this.getTuringSet('jge');
                ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                return turingSet;
            case '<':
                turingSet = this.getTuringSet('jl');
                ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                return turingSet;
            case '>':
                turingSet = this.getTuringSet('jg');
                ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                return turingSet;
            default:
                throw new Error(`Unknown relation ${rel}`);
        }
    },
    function read() {
        return this.getTuringSet('read');
    },
    function write() {
        return this.getTuringSet('write');
    },
    function halt() {
        return this.getTuringSet('halt');
    }
];
