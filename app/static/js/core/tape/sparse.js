import { Tape } from './tape.js';
export class SparseTape extends Tape {
    constructor() {
        super(...arguments);
        this.tape = new Map();
        this.minIndex = Number.MAX_SAFE_INTEGER;
        this.maxIndex = Number.MIN_SAFE_INTEGER;
    }
    write(symbol) {
        this.tape.set(this.head, symbol);
        this.minIndex = Math.min(this.minIndex, this.head);
        this.maxIndex = Math.max(this.maxIndex, this.head);
    }
    peek(position) {
        return this.tape.get(position) ?? this.undefinedSymbol;
    }
    getFullContents(padding) {
        return [this.head - (this.minIndex - padding), this.getSegments(this.minIndex, padding, this.maxIndex - this.minIndex + padding)];
    }
    reset() {
        super.reset();
        this.tape.clear();
        this.minIndex = 0;
        this.maxIndex = 0;
    }
}
