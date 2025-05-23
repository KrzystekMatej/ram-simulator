export var InstructionId;
(function (InstructionId) {
    InstructionId[InstructionId["Init"] = 0] = "Init";
    InstructionId[InstructionId["AssignConst"] = 1] = "AssignConst";
    InstructionId[InstructionId["AssignB"] = 2] = "AssignB";
    InstructionId[InstructionId["AssignC"] = 3] = "AssignC";
    InstructionId[InstructionId["Load"] = 4] = "Load";
    InstructionId[InstructionId["Store"] = 5] = "Store";
    InstructionId[InstructionId["Arithmetic"] = 6] = "Arithmetic";
    InstructionId[InstructionId["Jump"] = 7] = "Jump";
    InstructionId[InstructionId["CondJump"] = 8] = "CondJump";
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
    toString() {
        switch (this.id) {
            case InstructionId.Init:
                return 'init';
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
                throw Error(`Micro instruction with invalid id - ${this.id}.`);
        }
    }
}
