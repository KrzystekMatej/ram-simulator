import { Machine as TuringMachine } from "../../core/turing/machine";
import {UISymbolTape} from "./memory/symbol-tape";
import {toBlockLatex, toInlineLatex} from "../../utils/latex";


export class UITuringMachine {
    readonly sourceMachine: TuringMachine;

    readonly currentInstruction: HTMLElement;
    readonly currentTransition: HTMLElement;
    readonly tapes: UISymbolTape[];
    readonly program: HTMLElement;

    constructor(sourceMachine: TuringMachine) {
        this.sourceMachine = sourceMachine;

        this.currentInstruction = document.getElementById("turing-instruction")!;
        this.currentTransition = document.getElementById("turing-transition")!;
        this.tapes = [
            new UISymbolTape(this.sourceMachine.tapes[0], "turing-memory-a"),
            new UISymbolTape(this.sourceMachine.tapes[1], "turing-memory-b"),
            new UISymbolTape(this.sourceMachine.tapes[2], "turing-memory-c"),
            new UISymbolTape(this.sourceMachine.tapes[3], "turing-memory-t"),
            new UISymbolTape(this.sourceMachine.tapes[4], "turing-memory-m"),
            new UISymbolTape(this.sourceMachine.tapes[5], "turing-memory-i"),
            new UISymbolTape(this.sourceMachine.tapes[6], "turing-memory-o")
        ];
        this.program = document.getElementById("turing-program") as HTMLTextAreaElement;

    }

    update(resetTapeOffsets: boolean = true) : void {
        if (!resetTapeOffsets) this.resetTapeOffsets();

        this.currentInstruction.innerHTML = toInlineLatex(this.sourceMachine.currentInstruction.toLatex(this.sourceMachine.state));
        this.currentTransition.innerHTML = toInlineLatex(
            this.sourceMachine.currentInstruction.toLatexTransition(
                this.sourceMachine.state,
                this.sourceMachine.getHeadReads()
            )
        );

        this.tapes.forEach((tape) => tape.update());
        this.program.innerHTML = Array.from(this.sourceMachine.program)
            .map(([state, instructions]) =>
                instructions
                    .map(instruction => toInlineLatex(instruction.toLatex(state)))
                    .join("\n")
            )
            .join("\n");
        MathJax.typeset([this.currentInstruction, this.currentTransition]);
        MathJax.typesetPromise([this.program]);
    }

    resetTapeOffsets() {
        this.tapes.forEach((tape) => {
           tape.headOffset = 0;
        });
    }
}