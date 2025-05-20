export class Tape {
    constructor(undefinedSymbol) {
        this.head = 0;
        this.undefinedSymbol = undefinedSymbol;
    }
    move(move) {
        this.head += move;
    }
    tell() {
        return this.head;
    }
    seek(position) {
        this.head = position;
    }
    read() {
        return this.peek(this.head);
    }
    getSegments(position, left, right) {
        let result = [];
        let current = position - left;
        let end = position + right;
        while (current <= end) {
            result.push(this.peek(current));
            current++;
        }
        return result;
    }
    getSegmentsAroundHead(left, right) {
        return this.getSegments(this.head, left, right);
    }
    reset() {
        this.head = 0;
    }
}
