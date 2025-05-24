import {Machine} from "../core/micro-ram/machine";
import {Tape} from "../core/tape/tape";
import {TapeSymbol} from "../core/tape/symbol";
import {intDiv} from "../utils/math";

export class UIRamMachine {
    readonly ip: HTMLElement;

    readonly A: HTMLElement;
    readonly B: HTMLElement;
    readonly C: HTMLElement;

    readonly memory: [number, [HTMLElement, HTMLElement][]];

    readonly input: [number, NodeListOf<HTMLElement>];
    readonly output: [number, NodeListOf<HTMLElement>];

     readonly currentInstruction: HTMLElement;
    readonly program: HTMLTextAreaElement;

    constructor() {
        this.ip = document.getElementById("ram-ip")!;
        this.A = document.getElementById("ram-memory-a")!;
        this.B = document.getElementById("ram-memory-b")!;
        this.C = document.getElementById("ram-memory-c")!;

        const memoryItems = Array.from(
            document.querySelectorAll("#ram-memory-m .memory-item")
        ).map(item => {
            const address = item.querySelector(".memory-item-address")!
            const value = item.querySelector(".memory-item-value")!
            return [address, value] as [HTMLElement, HTMLElement]
        });

        this.memory = [0, memoryItems];
        this.input = [0, document.querySelectorAll("#ram-memory-i .tape-item")];
        this.output = [0, document.querySelectorAll("#ram-memory-o .tape-item")];

        this.currentInstruction = document.getElementById("ram-instruction")!;
        this.program = document.getElementById("ram-program-micro") as HTMLTextAreaElement;
    }

    update(ramMachine: Machine): void {
        this.ip.textContent = ramMachine.ip.toString();
        this.A.textContent = ramMachine.A.toString();
        this.B.textContent = ramMachine.B.toString();
        this.C.textContent = ramMachine.C.toString();
        this.updateMemory(ramMachine.memory);
        this.updateTape(ramMachine.input, this.input);
        this.updateTape(ramMachine.output, this.output);
        this.currentInstruction.textContent = ramMachine.currentInstruction.toString();
        this.program.textContent = ramMachine.program.map((instruction) => instruction.toString()).join('\n');
    }

    updateMemory(source: Map<number, number>) : void {
        const [startOffset, memoryItems] = this.memory;

        memoryItems.forEach((item, i) => {
           const [addressElem, valueElem] = item;
           const address = startOffset + i;
           const value = source.get(address);

           addressElem.textContent = address.toString();
           valueElem.textContent = value === undefined ? '0' : value.toString();
        });
    }

    updateTape(source: Tape<number | undefined>, dist: [number,  NodeListOf<HTMLElement>]) : void {
        const [headOffset, tapeItems] = dist;
        const headElementPos = intDiv(tapeItems.length, 2);
        const tapeContents = source.getSegments(headOffset + source.tell(), headElementPos, tapeItems.length - headElementPos - 1)
            .map((item) => item === undefined ? TapeSymbol.Blank : item.toString()
        );

        tapeItems.forEach((item, i) => {
            item.textContent = tapeContents[i];
        });
    }
}