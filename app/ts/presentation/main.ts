import { RamSimulator } from "../core/micro-ram/ram-simulator";
import { loadFileText } from "../utils/network";
import {UIRamMachine} from "./ui-ram-machine";
import {UITuringMachine} from "./ui-turing-machine";

let ramSimulator: RamSimulator;

const uiRam = new UIRamMachine();
const uiTuring = new UITuringMachine();


loadFileText("/static/assets/turing-sets.txt")
    .then(turingSets => {
        ramSimulator = new RamSimulator(turingSets);
        uiRam.update(ramSimulator.ramMachine);
        uiTuring.update(ramSimulator.turingMachine);
    })
    .catch(error => {
        console.error("Nepodařilo se načíst pravidla přechodové funkce turingova stroje:", error);
    });

