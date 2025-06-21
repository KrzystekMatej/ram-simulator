import { toInlineLatex } from "../../utils/latex.js";
import { buildIdentityMap } from "../../utils/collections.js";
export class UIProgram {
    constructor(programElementId) {
        this.rowMap = new Map();
        this.rowCount = 0;
        this.current = 0;
        this.content = document.getElementById(programElementId);
    }
    setRamProgram(instructions, labelMap = new Map()) {
        if (instructions.length === 0)
            return;
        this.current = 0;
        let programHtml = new Array();
        this.rowCount = 0;
        let hasIndent = false;
        for (let i = 0; i < instructions.length; i++) {
            let htmlIndent = hasIndent ? "padding-left: 2em;" : "";
            if (labelMap.has(i)) {
                hasIndent = true;
                programHtml.push(`<div class="program-line">&nbsp;</div>`);
                this.rowCount++;
                programHtml.push(`<div class="program-line">${toInlineLatex(`\\text{${labelMap.get(i)}}:`)}</div>`);
                this.rowCount++;
                programHtml.push(`<div class="program-line" style="padding-left: 2em;">${toInlineLatex(instructions[i].toLatex(labelMap))}</div>`);
                this.rowMap.set(i, this.rowCount);
                this.rowCount++;
            }
            else {
                programHtml.push(`<div class="program-line" style="${htmlIndent}">${toInlineLatex(instructions[i].toLatex(labelMap))}</div>`);
                this.rowMap.set(i, this.rowCount);
                this.rowCount++;
            }
        }
        this.content.innerHTML = programHtml.join('\n');
        this.programLines = this.content.querySelectorAll(`.program-line`);
        MathJax.typesetPromise([this.content]);
        this.markNext(0);
    }
    setTuringProgram(turingSet) {
        if (turingSet.size === 0)
            return;
        this.current = 0;
        const turingPairs = [...turingSet.entries()]
            .flatMap(([state, instructions]) => instructions.map(instruction => [state, instruction]));
        this.rowMap = buildIdentityMap(turingPairs.length);
        this.rowCount = turingPairs.length;
        let programHtml = new Array(this.rowCount);
        for (let i = 0; i < this.rowCount; i++) {
            const [state, instruction] = turingPairs[i];
            programHtml[i] = `<div class="program-line">${toInlineLatex(instruction.toLatex(state))}</div>`;
        }
        this.content.innerHTML = programHtml.join('\n');
        this.programLines = this.content.querySelectorAll(`.program-line`);
        MathJax.typesetPromise([this.content]);
        this.markNext(0);
    }
    markNext(next) {
        if (this.programLines === undefined)
            return;
        next = this.rowMap.get(next);
        this.programLines[this.current].style.backgroundColor = "#ffffff";
        this.current = next;
        this.programLines[this.current].style.backgroundColor = "#f8d7da";
    }
    clean() {
        this.programLines = undefined;
        this.content.innerHTML = '';
    }
}
