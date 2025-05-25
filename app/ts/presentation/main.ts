import { RamTuringSimulator } from "../core/ram-turing-simulator";
import { loadFileText } from "../utils/network";
import {UISimulator} from "./simulation/simulator";
import { errorModal} from "./components/components";
import {getErrorMessage} from "../utils/error-handling";

let simulator: UISimulator;


loadFileText("/static/assets/turing-sets.txt")
    .then(turingSets => {
        const ramTuringSimulator = new RamTuringSimulator(turingSets, true);
        simulator = new UISimulator(ramTuringSimulator);
        simulator.reset();
    })
    .catch(error => {
        errorModal.show(`Nepodařilo se načíst pravidla přechodové funkce turingova stroje: ${getErrorMessage(error)}`);
    });

