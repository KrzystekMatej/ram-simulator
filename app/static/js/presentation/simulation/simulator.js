import { UITuringMachine } from "./turing-machine.js";
import { UIRamMachine } from "./ram-machine.js";
import { getErrorMessage } from "../../utils/error-handling.js";
import { errorModal } from "../components/components.js";
export class UISimulator {
    constructor(simulator) {
        this.simulator = simulator;
        this.ramMachine = new UIRamMachine(simulator.ramMachine);
        this.turingMachine = new UITuringMachine(simulator.turingMachine);
        this.ramStepButton = document.getElementById('ram-step-button');
        this.turingStepButton = document.getElementById('turing-step-button');
        this.ramStepButton.addEventListener('click', () => this.ramStep());
        this.turingStepButton.addEventListener('click', () => this.turingStep());
        this.loadMacroButton = document.getElementById('load-macro-button');
        this.loadMicroButton = document.getElementById('load-micro-button');
        this.loadMacroButton.addEventListener('click', () => this.loadMacro());
        this.loadMicroButton.addEventListener('click', () => this.loadMicro());
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
    loadMacro() {
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
    loadMicro() {
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
    reset() {
        this.simulator.reset();
        this.ramMachine.update();
        this.turingMachine.update();
    }
}
