import {
    Instruction,
    InstructionId
} from './instruction';
import { LinearTape } from '../tape/linear';
import { Move } from '../tape/move';
import { safeAdd, safeIntDiv, safeMul, safeSub  } from '../../utils/math';
import { prefixFunctionErrors } from '../../utils/error-handling';

export class Machine {
    ip: number = 0;

    A: number = 0;
    B: number = 0;
    C: number = 0;

    memory: Map<number, number> = new Map();

    input: LinearTape<number | undefined> = new LinearTape(undefined);
    output: LinearTape<number | undefined> = new LinearTape(undefined);

    program: Instruction[] = [];
    currentInstruction: Instruction = new Instruction(InstructionId.Halt);

    static readonly handlers: ((this: Machine, ...args: any[]) => void)[] = [
        function init(...inputs: number[]) {
            inputs.forEach((value) => {
                this.input.write(value);
                this.input.move(Move.Right);
            });
            this.input.seek(0);
        },
        function assignConst(value: number) {
            this.A = value;
        },
        function assignB() {
            this.B = this.A;
        },
        function assignC() {
            this.C = this.A;
        },
        function load() {
            let val: number;
            if (this.memory.has(this.A)) {
                val = this.memory.get(this.A) as number;
            }
            else {
                val = 0;
                this.memory.set(this.A, val);
            }
            this.A = val;
        },
        function store() {
            this.memory.set(this.C, this.A);
        },
        function arithmetic(op: string) {
            let result: number;
            switch (op) {
                case '+': result = safeAdd(this.A, this.B); break;
                case '-': result = safeSub(this.A, this.B); break;
                case '*': result = safeMul(this.A, this.B); break;
                case '/': result = safeIntDiv(this.A, this.B); break;
                default: throw new Error(`Unknown operator ${op}`);
            }
            this.A = result;
        },
        function jump(label: number) {
            this.ip = label - 1;
        },
        function conditionalJump(rel: string, label: number) {
            let cond = false;
            const a = this.A;
            switch (rel) {
                case '==': cond = a === 0; break;
                case '!=': cond = a !== 0; break;
                case '<': cond = a < 0; break;
                case '>': cond = a > 0; break;
                case '<=': cond = a <= 0; break;
                case '>=': cond = a >= 0; break;
                default: throw new Error(`Unknown relation ${rel}`);
            }
            if (cond) this.ip = label - 1;
        },
        function read() {
            const value = this.input.read();
            if (value === undefined) throw new Error("Missing input");
            this.input.move(Move.Right);
            this.A = value as number;
        },
        function write() {
            this.output.write(this.A);
            this.output.move(Move.Right);
        },
        function halt() {}
    ];

    initialize(program: Instruction[]): void {
        this.reset();
        this.setProgram(program);
        this.currentInstruction = this.program[this.ip];
    }

    setProgram(program: Instruction[]): void {
        this.program.length = 0;
        this.program.push(...program);
    }

    executeProgram() {
        while (this.currentInstruction.id === InstructionId.Halt) {
            this.execute();
            this.next();
        }
    }

    next(): Instruction {
        if (this.currentInstruction.id === InstructionId.Halt && this.ip >= this.program.length) return this.currentInstruction;
        this.ip++;
        this.currentInstruction = this.program[this.ip];
        return this.currentInstruction;
    }

    execute(): void {
        prefixFunctionErrors(`Execution error at line ${this.ip}: ${this.currentInstruction.toString()}`, () => Machine.handlers[this.currentInstruction.id].call(this, ...this.currentInstruction.args))
    }

    logState(): void {
        console.log(`[IP: ${this.ip}]`);
        console.log(`A = ${this.A}, B = ${this.B}, C = ${this.C}`);
        console.log(`Memory = { ${[...this.memory.entries()].map(([k, v]) => `${k}: ${v}`).join(', ')} }`);
        console.log(`Input = [${this.input.getFullContents(0).join(', ')}]`);
        console.log(`Output = [${this.output.getFullContents(0).join(', ')}]`);
    }

    reset(): void {
        this.ip = 0;
        this.A = 0;
        this.B = 0;
        this.C = 0;
        this.memory.clear();
        this.input.reset();
        this.output.reset();
        this.program.length = 0;
        this.currentInstruction = new Instruction(InstructionId.Halt);
    }
}

