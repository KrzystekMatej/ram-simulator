import { RamTuringSimulator } from "../core/ram-turing-simulator.js";
import { loadFileText } from "../utils/network.js";
import { UISimulator } from "./simulation/simulator.js";
import { errorModal } from "./components/components.js";
import { getErrorMessage } from "../utils/error-handling.js";
let simulator;
loadFileText("/static/assets/turing-sets.txt")
    .then(turingSets => {
    const ramTuringSimulator = new RamTuringSimulator(turingSets, true);
    simulator = new UISimulator(ramTuringSimulator);
    simulator.reset();
})
    .catch(error => {
    errorModal.show(`Nepodařilo se načíst pravidla přechodové funkce turingova stroje: ${getErrorMessage(error)}`);
});
