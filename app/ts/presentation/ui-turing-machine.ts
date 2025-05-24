import { Machine as TuringMachine } from "../core/turing/machine";
import {Tape} from "../core/tape/tape";
import {TapeSymbol} from "../core/tape/symbol";
import {TapeId} from "../core/turing/tape-id";
import {intDiv} from "../utils/math";


export class UITuringMachine {
    readonly state: HTMLElement;
    readonly currentInstruction: HTMLElement;
    readonly tapes: [number, NodeListOf<HTMLElement>][];
    readonly program: HTMLTextAreaElement;

    constructor() {
        this.state = document.getElementById("turing-state")!;
        this.currentInstruction = document.getElementById("turing-instruction")!;
        this.tapes = [
            [0, document.querySelectorAll("#turing-memory-a .tape-item")],
            [0, document.querySelectorAll("#turing-memory-b .tape-item")],
            [0, document.querySelectorAll("#turing-memory-c .tape-item")],
            [0, document.querySelectorAll("#turing-memory-t .tape-item")],
            [0, document.querySelectorAll("#turing-memory-m .tape-item")],
            [0, document.querySelectorAll("#turing-memory-i .tape-item")],
            [0, document.querySelectorAll("#turing-memory-o .tape-item")]
        ];
        this.program = document.getElementById("turing-program") as HTMLTextAreaElement;
    }

    update(turingMachine: TuringMachine) : void {
        this.state.textContent = turingMachine.state;
        this.currentInstruction.textContent = turingMachine.currentInstruction.toString(turingMachine.state);
        turingMachine.tapes.forEach((tape, i) => {
            this.updateTape(tape, i);
        })
        this.program.textContent = Array.from(turingMachine.program)
            .map(([state, instructions]) =>
                instructions
                    .map(instruction => instruction.toString(state))
                    .join("\n")
            )
            .join("\n");
    }

    updateTape(tape: Tape<TapeSymbol>, tapeId: TapeId) : void {
        const [headOffset, tapeItems] = this.tapes[tapeId];
        const headElementPos = intDiv(tapeItems.length, 2);
        const tapeContents = tape.getSegments(headOffset + tape.tell(), headElementPos, tapeItems.length - headElementPos - 1);
        tapeItems.forEach((item, i) => {
            item.textContent = tapeContents[i];
        });
    }
}