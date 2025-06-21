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
    static getLabel(numLabel, labelMap) {
        let label = `${numLabel}`;
        if (labelMap.has(numLabel))
            label = `\\text{${labelMap.get(numLabel)}}`;
        return label;
    }
    toString(labelMap = new Map()) {
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
                return `goto ${Instruction.getLabel(this.args[0], labelMap)}`;
            case InstructionId.CondJumpRegister:
                return `if (R${this.args[0]} ${this.args[1]} R${this.args[2]}) goto ${Instruction.getLabel(this.args[3], labelMap)}`;
            case InstructionId.CondJumpConstant:
                return `if (R${this.args[0]} ${this.args[1]} ${this.args[2]}) goto ${Instruction.getLabel(this.args[3], labelMap)}`;
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
    toLatex(labelMap = new Map()) {
        switch (this.id) {
            case InstructionId.Init:
                return `\\text{init}\\;[${this.args.join(',\\;')}]`;
            case InstructionId.AssignConst:
                return `R_{${this.args[0]}} = ${this.args[1]}`;
            case InstructionId.AssignRegister:
                return `R_{${this.args[0]}} = R_{${this.args[1]}}`;
            case InstructionId.Load:
                return `R_{${this.args[0]}} = [R_{${this.args[1]}}]`;
            case InstructionId.Store:
                return `[R_{${this.args[0]}}] = R_{${this.args[1]}}`;
            case InstructionId.ArithmeticRegister:
                return `R_{${this.args[0]}} = R_{${this.args[1]}}\\;${this.args[2]}\\;R_{${this.args[3]}}`;
            case InstructionId.ArithmeticConstant:
                return `R_{${this.args[0]}} = R_{${this.args[1]}}\\;${this.args[2]}\\;${this.args[3]}`;
            case InstructionId.Jump:
                return `\\textbf{goto}\\;${Instruction.getLabel(this.args[0], labelMap)}`;
            case InstructionId.CondJumpRegister:
                return `\\textbf{if}\\;(R_{${this.args[0]}}\\;${this.args[1]}\\;R_{${this.args[2]}})\\;\\textbf{goto}\\;${Instruction.getLabel(this.args[3], labelMap)}`;
            case InstructionId.CondJumpConstant:
                return `\\textbf{if}\\;(R_{${this.args[0]}}\\;${this.args[1]}\\;${this.args[2]})\\;\\textbf{goto}\\;${Instruction.getLabel(this.args[3], labelMap)}`;
            case InstructionId.Read:
                return `R_{${this.args[0]}} = \\text{READ}()`;
            case InstructionId.Write:
                return `\\text{WRITE}(R_{${this.args[0]}})`;
            case InstructionId.Halt:
                return `\\textbf{halt}`;
            default:
                throw new Error(`Instrukce s neznámým ID: ${this.id}`);
        }
    }
}
