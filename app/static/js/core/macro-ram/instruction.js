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
    toString() {
        switch (this.id) {
            case InstructionId.Init:
                return `init [${this.args.join(', ')}]`;
            case InstructionId.AssignConst:
                return `R${this.args[0]} = ${this.args[1]}`;
            case InstructionId.AssignRegister:
                return `R${this.args[0]} = R${this.args[1]}`;
            case InstructionId.Load:
                return `R${this.args[0]} = [R${this.args[1]}]`;
            case InstructionId.Store:
                return `[R${this.args[0]}] = R${this.args[1]}`;
            case InstructionId.ArithmeticRegister:
                return `R${this.args[0]} = R${this.args[1]} ${this.args[2]} R${this.args[3]}`;
            case InstructionId.ArithmeticConstant:
                return `R${this.args[0]} = R${this.args[1]} ${this.args[2]} ${this.args[3]}`;
            case InstructionId.Jump:
                return `goto ${this.args[0]}`;
            case InstructionId.CondJumpRegister:
                return `if (R${this.args[0]} ${this.args[1]} R${this.args[2]}) goto ${this.args[3]}`;
            case InstructionId.CondJumpConstant:
                return `if (R${this.args[0]} ${this.args[1]} ${this.args[2]}) goto ${this.args[3]}`;
            case InstructionId.Read:
                return `R${this.args[0]} = READ()`;
            case InstructionId.Write:
                return `WRITE(R${this.args[0]})`;
            case InstructionId.Halt:
                return `halt`;
            default:
                throw new Error(`Instrukce s neznámým ID: ${this.id}`);
        }
    }
}
