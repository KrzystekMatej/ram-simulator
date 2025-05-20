export var InstructionId;
(function (InstructionId) {
    InstructionId[InstructionId["AssignConst"] = 0] = "AssignConst";
    InstructionId[InstructionId["AssignB"] = 1] = "AssignB";
    InstructionId[InstructionId["AssignC"] = 2] = "AssignC";
    InstructionId[InstructionId["Load"] = 3] = "Load";
    InstructionId[InstructionId["Store"] = 4] = "Store";
    InstructionId[InstructionId["Arithmetic"] = 5] = "Arithmetic";
    InstructionId[InstructionId["Jump"] = 6] = "Jump";
    InstructionId[InstructionId["CondJump"] = 7] = "CondJump";
    InstructionId[InstructionId["Read"] = 8] = "Read";
    InstructionId[InstructionId["Write"] = 9] = "Write";
    InstructionId[InstructionId["Halt"] = 10] = "Halt";
    InstructionId[InstructionId["Count"] = 11] = "Count";
})(InstructionId || (InstructionId = {}));
export class Instruction {
    constructor(id, args = []) {
        this.id = id;
        this.args = args;
    }
    toString() {
        switch (this.id) {
            case InstructionId.AssignConst:
                return `A = ${this.args[0]}`;
            case InstructionId.AssignB:
                return `B = A`;
            case InstructionId.AssignC:
                return `C = A`;
            case InstructionId.Load:
                return `A = [A]`;
            case InstructionId.Store:
                return `[C] = A`;
            case InstructionId.Arithmetic:
                return `A = A ${this.args[0]} B`;
            case InstructionId.Jump:
                return `goto ${this.args[0]}`;
            case InstructionId.CondJump:
                return `if (A ${this.args[0]} 0) goto ${this.args[1]}`;
            case InstructionId.Read:
                return `A = READ()`;
            case InstructionId.Write:
                return `WRITE(A)`;
            case InstructionId.Halt:
                return "halt";
            default:
                throw Error("This micro instruction does not exist.");
        }
    }
}
