import { Move } from "./move";

export abstract class Tape<T> {
    protected head: number = 0;
    protected undefinedSymbol: T;

    constructor(undefinedSymbol: T) {
        this.undefinedSymbol = undefinedSymbol;
    }

    move(move: Move): void {
        this.head += move;
    }

    tell(): number {
        return this.head;
    }

    seek(position: number): void {
        this.head = position;
    }

    abstract peek(position: number): T;

    read(): T {
        return this.peek(this.head);
    }

    abstract write(symbol: T) : void;

    getSegments(position: number, left: number, right: number): T[]
    {
        let result: T[] = [];
        let current = position - left;
        let end = position + right;

        while (current <= end) {
            result.push(this.peek(current));
            current++;
        }

        return result;
    }

    getSegmentsAroundHead(left: number, right: number): T[] {
        return this.getSegments(this.head, left, right);
    }

    abstract getFullContents(padding: number): [number, T[]];

    reset(): void {
        this.head = 0;
    }
}
