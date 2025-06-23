import { RamTuringSimulator } from "../core/ram-turing-simulator";
import { loadFileText } from "../utils/network";
import {UISimulator} from "./simulation/simulator";
import { errorModal} from "./components/global-components";
import {getErrorMessage} from "../utils/error-handling";

let simulator: UISimulator;

const turingSetsUrlElement = document.getElementById(`turing-sets-url-src`) as HTMLInputElement | null;
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

