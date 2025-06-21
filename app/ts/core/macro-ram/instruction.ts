import {prepareTestNumbers} from "../../testing/helpers";

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

    private static getLabel(numLabel: number, labelMap: Map<number, string>) : string {
         let label = `${numLabel}`;
         if (labelMap.has(numLabel)) label = `\\text{${labelMap.get(numLabel) as string}}`;
         return label;
    }

    toString(labelMap: Map<number, string> = new Map()): string {
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

    toLatex(labelMap: Map<number, string> = new Map()): string {
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
