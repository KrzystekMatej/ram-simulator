import { UIRamMemory } from "./memory/ram-memory.js";
import { UINumberTape } from "./memory/number-tape.js";
import { Compiler as MicroCompiler } from "../../core/micro-ram/compiler.js";
import { Compiler as MacroCompiler } from "../../core/macro-ram/compiler.js";
import { ToMicroTranspiler } from "../../core/macro-ram/to-micro-transpiler.js";
import { toInlineLatex } from "../../utils/latex.js";
import { UIProgram } from "./program.js";
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
            macro: new UIProgram("ram-program-macro"),
            micro: new UIProgram("ram-program-micro")
        };
        this.macroCompiler = new MacroCompiler();
        this.microCompiler = new MicroCompiler();
        this.toMicroTranspiler = new ToMicroTranspiler();
    }
    update(resetTapeOffsets = true) {
        if (!resetTapeOffsets)
            this.resetTapeOffsets();
        this.ip.textContent = `IP: ${this.sourceMachine.ip.toString()}`;
        this.currentInstruction.innerHTML = toInlineLatex(this.sourceMachine.currentInstruction.toLatex());
        MathJax.typeset([this.currentInstruction]);
        this.A.textContent = this.sourceMachine.A.toString();
        this.B.textContent = this.sourceMachine.B.toString();
        this.C.textContent = this.sourceMachine.C.toString();
        this.memory.update();
        this.input.update();
        this.output.update();
        if (this.microMacroMap !== undefined) {
            this.program.macro.markNext(this.microMacroMap.get(this.sourceMachine.ip));
        }
        this.program.micro.markNext(this.sourceMachine.ip);
    }
    resetTapeOffsets() {
        this.input.headOffset = 0;
        this.output.headOffset = 0;
    }
    compileMacro(rawProgram) {
        const [macroProgram, labelMapMacro] = this.macroCompiler.compile(rawProgram);
        this.program.macro.setRamProgram(macroProgram, labelMapMacro);
        const [microProgram, microMacroMap] = this.toMicroTranspiler.transpile(macroProgram);
        this.microMacroMap = microMacroMap;
        this.program.micro.setRamProgram(microProgram);
        return microProgram;
    }
    compileMicro(rawProgram) {
        const [microProgram, labelMap] = this.microCompiler.compile(rawProgram);
        this.program.micro.setRamProgram(microProgram, labelMap);
        this.microMacroMap = undefined;
        this.program.macro.clean();
        return microProgram;
    }
}
