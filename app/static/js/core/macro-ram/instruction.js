export var InstructionId;
(function (InstructionId) {
    InstructionId[InstructionId["Init"] = 0] = "Init";
    InstructionId[InstructionId["AssignConst"] = 1] = "AssignConst";
    InstructionId[InstructionId["AssignRegister"] = 2] = "AssignRegister";
    InstructionId[InstructionId["Load"] = 3] = "Load";
    InstructionId[InstructionId["Store"] = 4] = "Store";
    InstructionId[InstructionId["ArithmeticRegister"] = 5] = "ArithmeticRegister";
    InstructionId[InstructionId["ArithmeticConstant"] = 6] = "ArithmeticConstant";
    InstructionId[InstructionId["Jump"] = 7] = "Jump";
    InstructionId[InstructionId["CondJumpRegister"] = 8] = "CondJumpRegister";
    InstructionId[InstructionId["CondJumpConstant"] = 9] = "CondJumpConstant";
    InstructionId[InstructionId["Read"] = 10] = "Read";
    InstructionId[InstructionId["Write"] = 11] = "Write";
    InstructionId[InstructionId["Halt"] = 12] = "Halt";
    InstructionId[InstructionId["Count"] = 13] = "Count";
})(InstructionId || (InstructionId = {}));
export class Instruction {
    constructor(id, args = []) {
        this.id = id;
        this.args = args;
    }
}
