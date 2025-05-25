import {Machine as RamMachine} from "../../core/micro-ram/machine";
import {UIRamMemory} from "./memory/ram-memory";
import {UINumberTape} from "./memory/number-tape";
import {Compiler as MicroCompiler} from "../../core/micro-ram/compiler";
import {Compiler as MacroCompiler} from "../../core/macro-ram/compiler";
import {ToMicroTranspiler} from "../../core/macro-ram/to-micro-transpiler";
import {Instruction as MicroInstruction} from "../../core/micro-ram/instruction";
import {toInlineLatex} from "../../utils/latex";

export class UIRamMachine {
    readonly sourceMachine: RamMachine;

    readonly ip: HTMLElement;

    readonly A: HTMLElement;
    readonly B: HTMLElement;
    readonly C: HTMLElement;

    readonly memory: UIRamMemory;

    readonly input: UINumberTape;
    readonly output: UINumberTape;

    readonly currentInstruction: HTMLElement;

    readonly program: { macro: HTMLTextAreaElement, micro: HTMLTextAreaElement };

    readonly macroCompiler: MacroCompiler;
    readonly microCompiler: MicroCompiler;
    readonly toMicroTranspiler: ToMicroTranspiler;


    constructor(source: RamMachine) {
        this.sourceMachine = source;

        this.ip = document.getElementById("ram-ip")!;
        this.A = document.getElementById("ram-memory-a")!;
        this.B = document.getElementById("ram-memory-b")!;
        this.C = document.getElementById("ram-memory-c")!;

        this.memory = new UIRamMemory(this.sourceMachine.memory, "ram-memory-m");
        this.input = new UINumberTape(this.sourceMachine.input, "ram-memory-i");
        this.output = new UINumberTape(this.sourceMachine.output, "ram-memory-o");
        this.currentInstruction = document.getElementById("ram-instruction")!;
        this.program = {
            macro: document.getElementById("ram-program-macro") as HTMLTextAreaElement,
            micro: document.getElementById("ram-program-micro") as HTMLTextAreaElement
        };

        this.macroCompiler = new MacroCompiler();
        this.microCompiler = new MicroCompiler();
        this.toMicroTranspiler = new ToMicroTranspiler();
    }

    update(resetTapeOffsets: boolean = true): void {
        if (!resetTapeOffsets) this.resetTapeOffsets();

        this.ip.textContent = this.sourceMachine.ip.toString();
        this.A.textContent = this.sourceMachine.A.toString();
        this.B.textContent = this.sourceMachine.B.toString();
        this.C.textContent = this.sourceMachine.C.toString();
        this.memory.update();
        this.input.update();
        this.output.update();
        this.currentInstruction.innerHTML = toInlineLatex(this.sourceMachine.currentInstruction.toLatex());
        MathJax.typeset([this.currentInstruction]);
    }

    resetTapeOffsets() {
        this.input.headOffset = 0;
        this.output.headOffset = 0;
    }

    compileMacro() : MicroInstruction[] {
        const rawProgram: string = this.program.macro.value ?? '';
        const macroProgram = this.macroCompiler.compile(rawProgram);
        this.program.macro.value = macroProgram.map((instruction) => instruction.toString()).join('\n');
        const [microProgram, _] = this.toMicroTranspiler.transpile(macroProgram);
        this.program.micro.value = microProgram.map((instruction) => instruction.toString()).join('\n');
        return microProgram;
    }

    compileMicro() : MicroInstruction[] {
        const rawProgram: string = this.program.micro.value ?? '';
        const microProgram = this.microCompiler.compile(rawProgram);
        this.program.micro.value = microProgram.map((instruction) => instruction.toString()).join('\n');
        return microProgram;
    }
}