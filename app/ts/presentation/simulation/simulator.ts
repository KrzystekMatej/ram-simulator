import {RamTuringSimulator} from "../../core/ram-turing-simulator";
import {UITuringMachine} from "./turing-machine";
import {UIRamMachine} from "./ram-machine";
import { getErrorMessage } from "../../utils/error-handling";
import {errorModal, turingProgramModal} from "../components/global-components";
import {HoldScrollButton} from "../components/hold-scroll-button";
import {loadProgramModal} from "../components/global-components";
import {toBlockLatex, toInlineLatex} from "../../utils/latex";

export class UISimulator {
    readonly simulator: RamTuringSimulator;
    readonly ramMachine: UIRamMachine;
    readonly turingMachine: UITuringMachine;

    constructor(simulator: RamTuringSimulator) {
        this.simulator = simulator;
        this.ramMachine = new UIRamMachine(simulator.ramMachine);
        this.turingMachine = new UITuringMachine(simulator.turingMachine);

        new HoldScrollButton(document.getElementById('ram-step-button')!,
            () => this.ramStep(), 200, 120
        );
        new HoldScrollButton(document.getElementById('turing-step-button')!,
            () => this.turingStep(), 200, 120
        );

        document.getElementById('load-macro-button')!.addEventListener('click', () => this.loadMacro());
        document.getElementById('load-micro-button')!.addEventListener('click', () => this.loadMicro());

        document.getElementById('show-compact-turing-program')!.addEventListener('click', () => this.showCompactTuringProgram());
    }

    ramStep() {
        try {
            this.simulator.ramStep();
            this.ramMachine.update();
            this.turingMachine.update();
        } catch(e) {
            errorModal.show(getErrorMessage(e));
        }
    }

    turingStep() {
        try {
            this.simulator.turingStep();
            this.ramMachine.update();
            this.turingMachine.update();
        } catch(e) {
            errorModal.show(getErrorMessage(e));
        }
    }

    loadMacro() : void {
        try {
            loadProgramModal.show("macro")
                .then(programContent => {
                    const program = this.ramMachine.compileMacro(programContent);
                    this.simulator.initialize(program);
                    this.ramMachine.update();
                    this.turingMachine.update();
                })
                .catch(error => {
                    if (error instanceof Error && error.message === 'Modal closed without selection.') {
                        return;
                    }
                    console.warn("Micro program loading failed:", error.message);
                    errorModal.show(getErrorMessage(error));
                });
        } catch(e) {
            errorModal.show(getErrorMessage(e));
        }
    }

    loadMicro(): void {
        try {
            loadProgramModal.show("micro")
                .then(programContent => {
                    const program = this.ramMachine.compileMicro(programContent);
                    this.simulator.initialize(program);
                    this.ramMachine.update();
                    this.turingMachine.update();
                })
                .catch(error => {
                    if (error instanceof Error && error.message === 'Modal closed without selection.') {
                        return;
                    }
                    console.warn("Micro program loading failed:", error.message);
                    errorModal.show(getErrorMessage(error));
                });
        } catch(e) {
            errorModal.show(getErrorMessage(e));
        }
    }

    showCompactTuringProgram(): void {
        const latex = this.simulator.ramMachine.program
            .map((ramInst, ip) =>
                Array.from(this.simulator.transpiler.transpile(ramInst, ip).entries())
                    .map(([state, instructions]) =>
                        instructions.map(turingInst =>
                            `<div>${toInlineLatex(turingInst.toLatex(state))}</div>`
                        ).join("")
                    ).join("")
            ).join("");
        turingProgramModal.show("Celá přechodová funkce programu ve zkrácené formě", latex)
    }

    reset() {
        this.simulator.reset();
        this.ramMachine.update();
        this.turingMachine.update();
    }
}