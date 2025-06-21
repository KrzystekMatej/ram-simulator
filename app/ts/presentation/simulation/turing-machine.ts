import { Machine as TuringMachine } from "../../core/turing/machine";
import { UISymbolTape } from "./memory/symbol-tape";
import { toInlineLatex } from "../../utils/latex";
import { UIProgram } from "./program"


export class UITuringMachine {
    readonly sourceMachine: TuringMachine;

    readonly currentInstruction: HTMLElement;
    readonly currentTransition: HTMLElement;
    readonly tapes: UISymbolTape[];
    readonly program: UIProgram;

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
        this.program = new UIProgram("turing-program");
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

        MathJax.typeset([this.currentInstruction, this.currentTransition]);

        this.tapes.forEach((tape) => tape.update());

        this.program.setTuringProgram(this.sourceMachine.program);
        let programEntries = Array.from(this.sourceMachine.program.entries());
        let offset = 0;
        for (let i = 0; i < programEntries.length; ++i) {
            const [state, instructions] = programEntries[i];
            if (state === this.sourceMachine.state) {
                offset += this.sourceMachine.ordering;
                break;
            }
            offset += instructions.length;
        }
        this.program.markNext(offset);
    }

    resetTapeOffsets() {
        this.tapes.forEach((tape) => {
           tape.headOffset = 0;
        });
    }
}