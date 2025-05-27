import {MessageModal} from "./message-modal";
import {LoadProgramModal} from "./load-program-modal";
import {TuringProgramModal} from "./turing-program-modal";

export const errorModal: MessageModal = new MessageModal('error-modal');
export const loadProgramModal: LoadProgramModal = new LoadProgramModal('load-program-modal');
export const turingProgramModal = new TuringProgramModal('turing-program-modal');