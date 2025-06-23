import { RamTuringSimulator } from "../core/ram-turing-simulator.js";
import { loadFileText } from "../utils/network.js";
import { UISimulator } from "./simulation/simulator.js";
import { errorModal } from "./components/global-components.js";
import { getErrorMessage } from "../utils/error-handling.js";
let simulator;
const turingSetsUrlElement = document.getElementById(`turing-sets-url-src`);
if (!turingSetsUrlElement || !turingSetsUrlElement.value) {
    const errorMsg = `URL source element for turing transition function specification not found or has no value. The simulation can't be launched.`;
    console.error(errorMsg);
}
else {
    loadFileText(turingSetsUrlElement.value)
        .then(turingSets => {
        const ramTuringSimulator = new RamTuringSimulator(turingSets, false);
        simulator = new UISimulator(ramTuringSimulator);
        simulator.reset();
    })
        .catch(error => {
        errorModal.show(`Během inicializace simulátoru došlo k chybě: ${getErrorMessage(error)}`);
    });
}
