
export enum InstructionId {
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
}
