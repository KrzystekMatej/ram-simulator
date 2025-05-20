export var InstructionId;
(function (InstructionId) {
    InstructionId[InstructionId["AssignConst"] = 0] = "AssignConst";
    InstructionId[InstructionId["AssignRegister"] = 1] = "AssignRegister";
    InstructionId[InstructionId["Load"] = 2] = "Load";
    InstructionId[InstructionId["Store"] = 3] = "Store";
    InstructionId[InstructionId["ArithmeticRegister"] = 4] = "ArithmeticRegister";
    InstructionId[InstructionId["ArithmeticConstant"] = 5] = "ArithmeticConstant";
    InstructionId[InstructionId["Jump"] = 6] = "Jump";
    InstructionId[InstructionId["CondJumpRegister"] = 7] = "CondJumpRegister";
    InstructionId[InstructionId["CondJumpConstant"] = 8] = "CondJumpConstant";
    InstructionId[InstructionId["Read"] = 9] = "Read";
    InstructionId[InstructionId["Write"] = 10] = "Write";
    InstructionId[InstructionId["Halt"] = 11] = "Halt";
    InstructionId[InstructionId["Count"] = 12] = "Count";
})(InstructionId || (InstructionId = {}));
export class Instruction {
    constructor(id, args = []) {
        this.id = id;
        this.args = args;
    }
}
