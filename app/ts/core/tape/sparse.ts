import { Tape } from './tape';
import { TapeSymbol } from './symbol';
import { Move } from "./move";

export class SparseTape<T> extends Tape<T> {
    private tape: Map<number, T> = new Map();
    private minIndex: number = Number.MAX_SAFE_INTEGER;
    private maxIndex: number = Number.MIN_SAFE_INTEGER;

    override write(symbol: T): void {
        this.tape.set(this.head, symbol);
        this.minIndex = Math.min(this.minIndex, this.head);
        this.maxIndex = Math.max(this.maxIndex, this.head);
    }

    override peek(position: number): T {
        return this.tape.get(position) ?? this.undefinedSymbol;
    }

    override getFullContents(padding: number): [number, T[]] {
        return [this.head - (this.minIndex - padding), this.getSegments(this.minIndex, padding, this.maxIndex - this.minIndex + padding)];
    }

    override reset(): void {
        super.reset();
        this.tape.clear();
        this.minIndex = 0;
        this.maxIndex = 0;
    }
}
