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
    static getLabel(numLabel, labelMap) {
        let label = `${numLabel}`;
        if (labelMap.has(numLabel))
            label = `\\text{${labelMap.get(numLabel)}}`;
        return label;
    }
    toString(labelMap = new Map()) {
        switch (this.id) {
            case InstructionId.Init:
                return `init [${this.args.map((n) => n.toString()).join(', ')}]`;
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
                return `goto ${Instruction.getLabel(this.args[0], labelMap)}`;
            case InstructionId.CondJump:
                return `if (A ${this.args[0]} 0) goto ${Instruction.getLabel(this.args[1], labelMap)}`;
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
    toLatex(labelMap = new Map()) {
        switch (this.id) {
            case InstructionId.Init:
                return `\\text{init}\\;[${this.args.map(n => n.toString()).join(',\\;')}]`;
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
                return `A = A\\;${this.args[0]}\\;B`;
            case InstructionId.Jump:
                return `\\textbf{goto}\\;${Instruction.getLabel(this.args[0], labelMap)}`;
            case InstructionId.CondJump:
                return `\\textbf{if}\\;(A\\;${this.args[0]}\\;0)\\;\\textbf{goto}\\;${Instruction.getLabel(this.args[1], labelMap)}`;
            case InstructionId.Read:
                return `A = \\text{READ}()`;
            case InstructionId.Write:
                return `\\text{WRITE}(A)`;
            case InstructionId.Halt:
                return `\\textbf{halt}`;
            default:
                throw Error(`Micro instruction with invalid id - ${this.id}.`);
        }
    }
}
