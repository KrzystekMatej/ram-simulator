import { LinearTape } from '../tape/linear';
import { Move } from '../tape/move';
export class Machine {
    constructor() {
        this.ip = 0;
        this.A = 0;
        this.B = 0;
        this.C = 0;
        this.memory = new Map();
        this.input = new LinearTape(undefined);
        this.output = new LinearTape(undefined);
    }
    initInputs(inputs) {
        inputs.forEach((value) => {
            this.input.write(value);
            this.input.move(Move.Right);
        });
        this.input.seek(0);
    }
    execute(instruction) {
        Machine.handlers[instruction.id].call(this, ...instruction.args);
        this.ip++;
        this.logState();
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
    }
}
Machine.handlers = [
    function assignConst(value) {
        console.log(`A = ${value}`);
        this.A = value;
    },
    function assignB() {
        console.log(`B = A (${this.A})`);
        this.B = this.A;
    },
    function assignC() {
        console.log(`C = A (${this.A})`);
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
        console.log(`A = [${this.A}] = ${val}`);
    },
    function store() {
        console.log(`[${this.C}] = A (${this.A})`);
        this.memory.set(this.C, this.A);
    },
    function arithmetic(op) {
        let result;
        switch (op) {
            case '+':
                result = this.A + this.B;
                break;
            case '-':
                result = this.A - this.B;
                break;
            case '*':
                result = this.A * this.B;
                break;
            case '/':
                result = this.B === 0 ? 0 : Math.trunc(this.A / this.B);
                break;
            default: throw new Error(`Unknown op ${op}`);
        }
        console.log(`A = A ${op} B → ${result}`);
        this.A = result;
    },
    function jump(label) {
        console.log(`goto ${label}`);
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
        console.log(`if (A ${rel} 0) → ${cond} → ${cond ? `goto ${label}` : 'no jump'}`);
        if (cond)
            this.ip = label - 1;
    },
    function read() {
        const value = this.input.read();
        this.input.move(Move.Right);
        console.log(`A = READ() → ${value}`);
        this.A = value;
    },
    function write() {
        console.log(`WRITE(A) → ${this.A}`);
        this.output.write(this.A);
        this.output.move(Move.Right);
    },
    function halt() {
        console.log(`halt`);
        this.ip = -2;
    }
];
