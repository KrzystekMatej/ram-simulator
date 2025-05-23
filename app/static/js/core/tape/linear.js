import { Tape } from './tape';
export class LinearTape extends Tape {
    constructor() {
        super(...arguments);
        this.tape = [];
        this.zeroOffset = 0;
    }
    write(symbol) {
        let tapePosition = this.zeroOffset + this.head;
        while (tapePosition < 0) {
            this.tape.unshift(this.undefinedSymbol);
            this.zeroOffset++;
            tapePosition++;
        }
        while (tapePosition >= this.tape.length) {
            this.tape.push(this.undefinedSymbol);
        }
        this.tape[tapePosition] = symbol;
    }
    peek(position) {
        let tapePosition = this.zeroOffset + position;
        if (tapePosition < 0 || tapePosition >= this.tape.length) {
            return this.undefinedSymbol;
        }
        return this.tape[tapePosition];
    }
    getFullContents(padding) {
        return [this.zeroOffset + this.head, this.getSegments(0, this.zeroOffset + padding, this.tape.length - this.zeroOffset - 1 + padding)];
    }
    reset() {
        super.reset();
        this.tape = [];
        this.zeroOffset = 0;
    }
    load(tape) {
        this.tape = tape;
        this.head = 0;
    }
}
