
export enum InstructionId {
    Init,
    AssignConst,
    AssignRegister,
    Load,
    Store,
    ArithmeticRegister,
    ArithmeticConstant,
    Jump,
    CondJumpRegister,
    CondJumpConstant,
    Read,
    Write,
    Halt,
    Count
}

export class Instruction {
    id: InstructionId;
    args: any[];

    constructor(id: InstructionId, args: any[] = []) {
        this.id = id;
        this.args = args;
    }

    toString(): string {
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
