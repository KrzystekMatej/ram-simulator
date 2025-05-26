import { UITuringMachine } from "./turing-machine.js";
import { UIRamMachine } from "./ram-machine.js";
import { getErrorMessage } from "../../utils/error-handling.js";
import { errorModal } from "../components/global-components.js";
import { HoldScrollButton } from "../components/hold-scroll-button.js";
import { loadProgramModal } from "../components/global-components.js";
export class UISimulator {
    constructor(simulator) {
        this.simulator = simulator;
        this.ramMachine = new UIRamMachine(simulator.ramMachine);
        this.turingMachine = new UITuringMachine(simulator.turingMachine);
        new HoldScrollButton(document.getElementById('ram-step-button'), () => this.ramStep(), 200, 120);
        new HoldScrollButton(document.getElementById('turing-step-button'), () => this.turingStep(), 200, 120);
        document.getElementById('compile-macro-button').addEventListener('click', () => this.compileMacro());
        document.getElementById('compile-micro-button').addEventListener('click', () => this.compileMicro());
        document.getElementById('load-macro-button').addEventListener('click', () => this.loadMacro());
        document.getElementById('load-micro-button').addEventListener('click', () => this.loadMicro());
    }
    ramStep() {
        try {
            this.simulator.ramStep();
            this.ramMachine.update();
            this.turingMachine.update();
        }
        catch (e) {
            errorModal.show(getErrorMessage(e));
        }
    }
    turingStep() {
        try {
            this.simulator.turingStep();
            this.ramMachine.update();
            this.turingMachine.update();
        }
        catch (e) {
            errorModal.show(getErrorMessage(e));
        }
    }
    compileMacro() {
        try {
            const program = this.ramMachine.compileMacro();
            this.simulator.initialize(program);
            this.ramMachine.update();
            this.turingMachine.update();
        }
        catch (e) {
            errorModal.show(getErrorMessage(e));
        }
    }
    compileMicro() {
        try {
            const program = this.ramMachine.compileMicro();
            this.simulator.initialize(program);
            this.ramMachine.update();
            this.turingMachine.update();
        }
        catch (e) {
            errorModal.show(getErrorMessage(e));
        }
    }
    loadMacro() {
        try {
            loadProgramModal.show("macro")
                .then(programContent => {
                const macroTextarea = document.getElementById('ram-program-macro');
                macroTextarea.value = programContent;
            })
                .catch(error => {
                console.warn("Macro program loading cancelled or failed:", error.message);
            });
        }
        catch (e) {
            errorModal.show(getErrorMessage(e));
        }
    }
    loadMicro() {
        try {
            loadProgramModal.show("micro")
                .then(programContent => {
                const microTextarea = document.getElementById('ram-program-micro');
                microTextarea.value = programContent;
            })
                .catch(error => {
                console.warn("Micro program loading cancelled or failed:", error.message);
            });
        }
        catch (e) {
            errorModal.show(getErrorMessage(e));
        }
    }
    reset() {
        this.simulator.reset();
        this.ramMachine.update();
        this.turingMachine.update();
    }
}
