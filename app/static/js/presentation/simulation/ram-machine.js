import { UIRamMemory } from "./memory/ram-memory.js";
import { UINumberTape } from "./memory/number-tape.js";
import { Compiler as MicroCompiler } from "../../core/micro-ram/compiler.js";
import { Compiler as MacroCompiler } from "../../core/macro-ram/compiler.js";
import { ToMicroTranspiler } from "../../core/macro-ram/to-micro-transpiler.js";
import { toInlineLatex } from "../../utils/latex.js";
export class UIRamMachine {
    constructor(source) {
        this.sourceMachine = source;
        this.ip = document.getElementById("ram-ip");
        this.A = document.getElementById("ram-memory-a");
        this.B = document.getElementById("ram-memory-b");
        this.C = document.getElementById("ram-memory-c");
        this.memory = new UIRamMemory(this.sourceMachine.memory, "ram-memory-m");
        this.input = new UINumberTape(this.sourceMachine.input, "ram-memory-i");
        this.output = new UINumberTape(this.sourceMachine.output, "ram-memory-o");
        this.currentInstruction = document.getElementById("ram-instruction");
        this.program = {
            macro: document.getElementById("ram-program-macro"),
            micro: document.getElementById("ram-program-micro")
        };
        this.macroCompiler = new MacroCompiler();
        this.microCompiler = new MicroCompiler();
        this.toMicroTranspiler = new ToMicroTranspiler();
    }
    update(resetTapeOffsets = true) {
        if (!resetTapeOffsets)
            this.resetTapeOffsets();
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
    compileMacro() {
        const rawProgram = this.program.macro.value ?? '';
        const macroProgram = this.macroCompiler.compile(rawProgram);
        this.program.macro.value = macroProgram.map((instruction) => instruction.toString()).join('\n');
        const [microProgram, _] = this.toMicroTranspiler.transpile(macroProgram);
        this.program.micro.value = microProgram.map((instruction) => instruction.toString()).join('\n');
        return microProgram;
    }
    compileMicro() {
        const rawProgram = this.program.micro.value ?? '';
        const microProgram = this.microCompiler.compile(rawProgram);
        this.program.micro.value = microProgram.map((instruction) => instruction.toString()).join('\n');
        return microProgram;
    }
}
