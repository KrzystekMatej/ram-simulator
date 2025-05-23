
export enum InstructionId {
    Init,
    AssignConst,
    AssignB,
    AssignC,
    Load,
    Store,
    Arithmetic,
    Jump,
    CondJump,
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

    toString() : string {
        switch(this.id) {
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
                throw Error(`Micro instruction with invalid id - ${this.id}.`)
        }
    }
}
