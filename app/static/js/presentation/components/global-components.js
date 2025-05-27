import { MessageModal } from "./message-modal.js";
import { LoadProgramModal } from "./load-program-modal.js";
import { TuringProgramModal } from "./turing-program-modal.js";
export const errorModal = new MessageModal('error-modal');
export const loadProgramModal = new LoadProgramModal('load-program-modal');
export const turingProgramModal = new TuringProgramModal('turing-program-modal');
