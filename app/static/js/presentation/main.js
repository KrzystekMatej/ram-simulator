import { RamSimulator } from "../core/micro-ram/ram-simulator.js";
import { loadFileText } from "../utils/network.js";
import { UIRamMachine } from "./ui-ram-machine.js";
import { UITuringMachine } from "./ui-turing-machine.js";
let ramSimulator;
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
