import { Instruction as RamInstruction } from './instruction';
import { TapeCondition, TapeAction, Instruction as TuringInstruction } from '../turing/instruction';
import { Move } from '../tape/move'
import { TapeSymbol } from '../tape/symbol';
import { TapeId } from '../turing/tape-id';
import { logSeparator, IntToMinimalTwosComplement } from '../../utils/utils';

const cond = (tape: TapeId, ...symbols: TapeSymbol[]): [TapeId, TapeCondition] => [tape, TapeCondition.multiple(symbols)];
const tapeAct = (target: TapeId, source: TapeId, move: Move): [TapeId, TapeAction] => [target, TapeAction.fromTape(source, move)];
const litAct = (tape: TapeId, symbol: TapeSymbol, move: Move): [TapeId, TapeAction] => [tape, TapeAction.fromLiteral(symbol, move)];

export class ToTuringTranspiler {

    instructionMap: Map<string, Map<string, TuringInstruction[]>> = new Map();

    initialize(text: string) {
        let currentInstruction: string | null = null;
        let currentMap: Map<string, TuringInstruction[]> | null = null;
    
        const lines = text.split('\n');
    
        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const line = rawLine.trim();
            if (line.length === 0) continue;
        
            if (line.startsWith('instruction:')) {
                currentInstruction = line.split(':')[1].trim();
                currentMap = new Map<string, TuringInstruction[]>();
                this.instructionMap.set(currentInstruction, currentMap);
            } else if (currentInstruction && currentMap) {
                try {
                    const [source, instruction] = TuringInstruction.fromString(line);
                    if (!currentMap.has(source)) {
                        currentMap.set(source, []);
                    }
                    currentMap.get(source)!.push(instruction);
                } catch (error) {
                    let message = 'Unknown error';
                    if (error instanceof Error) {
                        message = error.message;
                    }
                    throw new Error(`Error at line ${i + 1}: "${rawLine}"\n${message}`);
                }
            } else {
                throw new Error(`Unexpected line outside of instruction block at line ${i + 1}: "${rawLine}"`);
            }
        }
    }

    getTuringSet(instructionCode: string) {
        return new Map<string, TuringInstruction[]>(
            Array.from(
                (this.instructionMap.get(instructionCode) as Map<string, TuringInstruction[]>).entries(),
                ([key, value]) => [
                    key,
                    value.map(instr => new TuringInstruction(instr.target, instr.conditions, instr.actions))
            ])
        );
    }

    static logTuringSet(turingSet: Map<string, TuringInstruction[]>) {
        logSeparator();
        console.log("Turing Set:");
        for (const [state, instructions] of turingSet.entries()) {
            for (const instr of instructions) {
                console.log(instr.toString(state));
            }
        }
        logSeparator();
    }

    static specifyGotoLabel(turingSet: Map<string, TuringInstruction[]>, label: number) {
        const entries = Array.from(turingSet.entries());
    
        for (const [_, instructions] of entries) {
    
            instructions.forEach((turingInstruction) => {
                if (turingInstruction.target === 'goto_label')
                {
                    turingInstruction.target = `goto_${label}`
                }
            });
        }
    }

    static readonly handlers: ((this: ToTuringTranspiler, ...args: any[]) => Map<string, TuringInstruction[]>)[] = [
        function assignConst(constant: number) {
            console.log('transpile: assignConst');
            let turingSet: Map<string, TuringInstruction[]> = new Map();

            const twosComplement: string = IntToMinimalTwosComplement(constant);
            turingSet.set('start', [TuringInstruction.createNop('write_0')]);
            for (let i = 0; i < twosComplement.length; i++) {
                let write = litAct(TapeId.A, twosComplement[i] as TapeSymbol, Move.Right);
                turingSet.set(`write_${i}`, [TuringInstruction.createFromOrderedEntries(`write_${i+1}`, [], [write])]);
            }
            turingSet.set(`write_${twosComplement.length}`, [TuringInstruction.createFromOrderedEntries('next', [], [litAct(TapeId.A, TapeSymbol.End, Move.Left)])]);
            
            return turingSet;
        },
        function assignB() {
            console.log('transpile: assign B');
            return this.getTuringSet('assign_b');
        },
        function assignC() {
            console.log('transpile: assign C');
            return this.getTuringSet('assign_c');
        },
        function load() {
            console.log('transpile: load');
            return this.getTuringSet('load');
        },
        function store() {
            console.log('transpile: store');
            return this.getTuringSet('store');
        },
        function arithmetic(op: string) {
            console.log('transpile: arithmetic');
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
        function jump(label: number) {
            console.log('transpile: jump');
            let turingSet: Map<string, TuringInstruction[]> = this.getTuringSet('jmp');
            ToTuringTranspiler.specifyGotoLabel(turingSet, label);
            return turingSet;
        },
        function condJump(rel: string, label: number) {
            let turingSet: Map<string, TuringInstruction[]>;

            switch (rel) {
                case '==':
                    console.log('transpile: je');
                    turingSet = this.getTuringSet('je');
                    ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                    return turingSet;
                case '!=':
                    console.log('transpile: jne');
                    turingSet = this.getTuringSet('jne');
                    ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                    return turingSet;
                case '<=':
                    console.log('transpile: jle');
                    turingSet = this.getTuringSet('jle');
                    ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                    return turingSet;
                case '>=':
                    console.log('transpile: jge');
                    turingSet = this.getTuringSet('jge');
                    ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                    return turingSet;
                case '<':
                    console.log('transpile: jl');
                    turingSet = this.getTuringSet('jl');
                    ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                    return turingSet;
                case '>':
                    console.log('transpile: jg');
                    turingSet = this.getTuringSet('jg');
                    ToTuringTranspiler.specifyGotoLabel(turingSet, label);
                    return turingSet;
                default:
                    throw new Error(`Unknown relation ${rel}`);
            }
        },
        function read() {
            console.log('transpile: read');
            return this.getTuringSet('read');
        },
        function write() {
            console.log('transpile: write');
            return this.getTuringSet('write');
        },
        function halt() {
            console.log('transpile: halt');
            return this.getTuringSet('halt');
        }
    ];

    getInitializationSet(inputs: number[]): Map<string, TuringInstruction[]> {
        console.log('transpile: initialize');
        let turingSet: Map<string, TuringInstruction[]> = this.getTuringSet('init');

        if (inputs.length <= 0)
        {
            turingSet.set('input', [TuringInstruction.createNop('0_start')]);
            return turingSet;
        }

        turingSet.set('input', [TuringInstruction.createNop('input_0_0')]);


        inputs.forEach((value: number, index: number) => {
            const twosComplement: string = IntToMinimalTwosComplement(value);
            for (let i = 0; i < twosComplement.length; i++) {
                let write = litAct(TapeId.I, twosComplement[i] as TapeSymbol, Move.Right);
                turingSet.set(`input_${index}_${i}`, [TuringInstruction.createFromOrderedEntries(`input_${index}_${i+1}`, [], [write])]);
            }
            let next = `input_${index+1}_0`;
            let write = litAct(TapeId.I, TapeSymbol.Separator, Move.Right);
            if (index === inputs.length - 1) {
                next = `left_shift`;
                write = litAct(TapeId.I, TapeSymbol.Separator, Move.Left);
            }
            turingSet.set(`input_${index}_${twosComplement.length}`, [TuringInstruction.createFromOrderedEntries(next, [], [write])]);
        });

        turingSet.set('left_shift', [
            TuringInstruction.createFromOrderedEntries(
                'left_shift',
                [cond(TapeId.I, TapeSymbol.Zero, TapeSymbol.One, TapeSymbol.Separator)],
                [tapeAct(TapeId.I, TapeId.I, Move.Left)]
            ),
            TuringInstruction.createFromOrderedEntries(
                '0_start',
                [cond(TapeId.I, TapeSymbol.Blank)],
                [tapeAct(TapeId.I, TapeId.I, Move.Right)]
            )
        ]);
    
        return turingSet;
    }

    transpile(ramInstruction: RamInstruction, ip: number): Map<string, TuringInstruction[]> {
        let turingSet = ToTuringTranspiler.handlers[ramInstruction.id].apply(this, ramInstruction.args);
    
        const entries = Array.from(turingSet.entries());
    
        for (const [source_state, instructions] of entries) {
            turingSet.delete(source_state);
    
            let newKey: string;
            const gotoMatch = source_state.match(/^goto_(\d+)$/);
            if (source_state === "next") {
                newKey = `${ip + 1}_start`;
            } else if (gotoMatch) {
                newKey = `${gotoMatch[1]}_start`;
            } else {
                newKey = `${ip}_${source_state}`;
            }
    
            turingSet.set(newKey, instructions);
    
            instructions.forEach((turingInstruction) => {
                const target = turingInstruction.target;
                const targetGotoMatch = target.match(/^goto_(\d+)$/);
                if (target === "next") {
                    turingInstruction.target = `${ip + 1}_start`;
                } else if (targetGotoMatch) {
                    turingInstruction.target = `${targetGotoMatch[1]}_start`;
                } else {
                    turingInstruction.target = `${ip}_${target}`;
                }
            });
        }
    
        return turingSet;
    }
}
