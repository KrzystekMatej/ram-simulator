import {RamTuringSimulator} from "../../core/ram-turing-simulator";
import {UITuringMachine} from "./turing-machine";
import {UIRamMachine} from "./ram-machine";
import { getErrorMessage } from "../../utils/error-handling";
import { errorModal } from "../components/components";

export class UISimulator {
    readonly simulator: RamTuringSimulator;
    readonly ramMachine: UIRamMachine;
    readonly turingMachine: UITuringMachine;

    readonly ramStepButton: HTMLElement;
    readonly turingStepButton: HTMLElement;

    readonly loadMacroButton: HTMLElement;
    readonly loadMicroButton: HTMLElement;

    constructor(simulator: RamTuringSimulator) {
        this.simulator = simulator;
        this.ramMachine = new UIRamMachine(simulator.ramMachine);
        this.turingMachine = new UITuringMachine(simulator.turingMachine);

        this.ramStepButton = document.getElementById('ram-step-button') as HTMLElement;
        this.turingStepButton = document.getElementById('turing-step-button') as HTMLElement;
        this.ramStepButton.addEventListener('click', () => this.ramStep());
        this.turingStepButton.addEventListener('click', () => this.turingStep());

        this.loadMacroButton = document.getElementById('load-macro-button') as HTMLElement;
        this.loadMicroButton = document.getElementById('load-micro-button') as HTMLElement;
        this.loadMacroButton.addEventListener('click', () => this.loadMacro());
        this.loadMicroButton.addEventListener('click', () => this.loadMicro());
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

    loadMacro() {
        try {
            const program = this.ramMachine.compileMacro();
            this.simulator.initialize(program);
            this.ramMachine.update();
            this.turingMachine.update();
        } catch(e) {
            errorModal.show(getErrorMessage(e));
        }
    }

    loadMicro() {
        try {
            const program = this.ramMachine.compileMicro();
            this.simulator.initialize(program);
            this.ramMachine.update();
            this.turingMachine.update();
        } catch(e) {
            errorModal.show(getErrorMessage(e));
        }
    }

    reset() {
        this.simulator.reset();
        this.ramMachine.update();
        this.turingMachine.update();
    }
}