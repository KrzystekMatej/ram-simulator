import { Instruction, InstructionId } from './instruction';
import { LinearTape } from '../tape/linear';
import { Move } from '../tape/move';
import { prefixFunctionErrors, safeAdd, safeIntDiv, safeMul, safeSub } from "../../utils";
export class Machine {
    constructor() {
        this.ip = 0;
        this.A = 0;
        this.B = 0;
        this.C = 0;
        this.memory = new Map();
        this.input = new LinearTape(undefined);
        this.output = new LinearTape(undefined);
        this.program = [];
        this.current = new Instruction(InstructionId.Halt);
    }
    initialize(program) {
        this.reset();
        this.setProgram(program);
        this.current = this.program[this.ip];
    }
    setProgram(program) {
        this.program.length = 0;
        this.program.push(...program);
    }
    executeProgram() {
        while (this.current.id === InstructionId.Halt) {
            this.execute();
            this.next();
        }
    }
    next() {
        if (this.current.id === InstructionId.Halt && this.ip >= this.program.length)
            return this.current;
        this.ip++;
        this.current = this.program[this.ip];
        return this.current;
    }
    execute() {
        prefixFunctionErrors(`Execution error at line ${this.ip}: ${this.current.toString()}`, () => Machine.handlers[this.current.id].call(this, ...this.current.args));
    }
    logState() {
        console.log(`[IP: ${this.ip}]`);
        console.log(`A = ${this.A}, B = ${this.B}, C = ${this.C}`);
        console.log(`Memory = { ${[...this.memory.entries()].map(([k, v]) => `${k}: ${v}`).join(', ')} }`);
        console.log(`Input = [${this.input.getFullContents(0).join(', ')}]`);
        console.log(`Output = [${this.output.getFullContents(0).join(', ')}]`);
    }
    reset() {
        this.ip = 0;
        this.A = 0;
        this.B = 0;
        this.C = 0;
        this.memory.clear();
        this.input.reset();
        this.output.reset();
        this.program.length = 0;
        this.current = new Instruction(InstructionId.Halt);
    }
}
Machine.handlers = [
    function init(...inputs) {
        inputs.forEach((value) => {
            this.input.write(value);
            this.input.move(Move.Right);
        });
        this.input.seek(0);
    },
    function assignConst(value) {
        this.A = value;
    },
    function assignB() {
        this.B = this.A;
    },
    function assignC() {
        this.C = this.A;
    },
    function load() {
        let val;
        if (this.memory.has(this.A)) {
            val = this.memory.get(this.A);
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
    function arithmetic(op) {
        let result;
        switch (op) {
            case '+':
                result = safeAdd(this.A, this.B);
                break;
            case '-':
                result = safeSub(this.A, this.B);
                break;
            case '*':
                result = safeMul(this.A, this.B);
                break;
            case '/':
                result = safeIntDiv(this.A, this.B);
                break;
            default: throw new Error(`Unknown operator ${op}`);
        }
        this.A = result;
    },
    function jump(label) {
        this.ip = label - 1;
    },
    function conditionalJump(rel, label) {
        let cond = false;
        const a = this.A;
        switch (rel) {
            case '==':
                cond = a === 0;
                break;
            case '!=':
                cond = a !== 0;
                break;
            case '<':
                cond = a < 0;
                break;
            case '>':
                cond = a > 0;
                break;
            case '<=':
                cond = a <= 0;
                break;
            case '>=':
                cond = a >= 0;
                break;
            default: throw new Error(`Unknown relation ${rel}`);
        }
        if (cond)
            this.ip = label - 1;
    },
    function read() {
        const value = this.input.read();
        if (value === undefined)
            throw new Error("Missing input");
        this.input.move(Move.Right);
        this.A = value;
    },
    function write() {
        this.output.write(this.A);
        this.output.move(Move.Right);
    },
    function halt() { }
];
