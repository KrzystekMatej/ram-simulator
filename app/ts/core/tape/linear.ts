import { Tape } from './tape';
import { Move } from "./move";

export class LinearTape<T> extends Tape<T> {
    private tape: T[] = [];
    private zeroOffset: number = 0;

    override write(symbol: T) : void {
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

    override peek(position: number): T {
        let tapePosition = this.zeroOffset + position;

        if (tapePosition < 0 || tapePosition >= this.tape.length) {
            return this.undefinedSymbol;
        }
        return this.tape[tapePosition];
    }

    override getFullContents(padding: number): [number, T[]] {
        return [this.zeroOffset + this.head, this.getSegments(0, this.zeroOffset + padding, this.tape.length - this.zeroOffset - 1 + padding)];
    }

    override reset(): void {
        super.reset();
        this.tape = [];
        this.zeroOffset = 0;
    }

    load(tape: T[]): void {
        this.tape = tape;
        this.head = 0;
    }
}