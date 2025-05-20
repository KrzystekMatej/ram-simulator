import { Instruction, InstructionId } from './instruction';
export class Compiler {
    compile(text) {
        let instructions = [];
        for (const line of text.split('\n')) {
            const trimmed = line.trim();
            if (trimmed.length === 0 || trimmed.startsWith('//'))
                continue;
            instructions.push(this.parseInstruction(trimmed));
        }
        return instructions;
    }
    parseInstruction(line) {
        switch (true) {
            case /^R\d+\s*=\s*\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*(\d+)$/);
                return new Instruction(InstructionId.AssignConst, [parseInt(match[1]), parseInt(match[2])]);
            }
            case /^R\d+\s*=\s*R\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*R(\d+)$/);
                return new Instruction(InstructionId.AssignRegister, [parseInt(match[1]), parseInt(match[2])]);
            }
            case /^R\d+\s*=\s*\[R\d+\]$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*\[R(\d+)\]$/);
                return new Instruction(InstructionId.Load, [parseInt(match[1]), parseInt(match[2])]);
            }
            case /^\[R\d+\]\s*=\s*R\d+$/.test(line): {
                const match = line.match(/^\[R(\d+)\]\s*=\s*R(\d+)$/);
                return new Instruction(InstructionId.Store, [parseInt(match[1]), parseInt(match[2])]);
            }
            case /^R\d+\s*=\s*R\d+\s*[\+\-\*\/]\s*R\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*R(\d+)\s*([\+\-\*\/])\s*R(\d+)$/);
                return new Instruction(InstructionId.ArithmeticRegister, [parseInt(match[1]), parseInt(match[2]), match[3], parseInt(match[4])]);
            }
            case /^R\d+\s*=\s*R\d+\s*[\+\-\*\/]\s*\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*R(\d+)\s*([\+\-\*\/])\s*(\d+)$/);
                return new Instruction(InstructionId.ArithmeticConstant, [parseInt(match[1]), parseInt(match[2]), match[3], parseInt(match[4])]);
            }
            case /^goto\s+\d+$/.test(line): {
                const match = line.match(/^goto\s+(\d+)$/);
                return new Instruction(InstructionId.Jump, [parseInt(match[1])]);
            }
            case /^if\s*\(\s*R\d+\s*(==|!=|<=|>=|<|>)\s*R\d+\s*\)\s*goto\s*\d+$/.test(line): {
                const match = line.match(/^if\s*\(\s*R(\d+)\s*(==|!=|<=|>=|<|>)\s*R(\d+)\s*\)\s*goto\s*(\d+)$/);
                return new Instruction(InstructionId.CondJumpRegister, [parseInt(match[1]), match[2], parseInt(match[3]), parseInt(match[4])]);
            }
            case /^if\s*\(\s*R\d+\s*(==|!=|<=|>=|<|>)\s*\d+\s*\)\s*goto\s*\d+$/.test(line): {
                const match = line.match(/^if\s*\(\s*R(\d+)\s*(==|!=|<=|>=|<|>)\s*(\d+)\s*\)\s*goto\s*(\d+)$/);
                return new Instruction(InstructionId.CondJumpConstant, [parseInt(match[1]), match[2], parseInt(match[3]), parseInt(match[4])]);
            }
            case /^R\d+\s*=\s*READ\(\)$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*READ\(\)$/);
                return new Instruction(InstructionId.Read, [parseInt(match[1])]);
            }
            case /^WRITE\(R\d+\)$/.test(line): {
                const match = line.match(/^WRITE\(R(\d+)\)$/);
                return new Instruction(InstructionId.Write, [parseInt(match[1])]);
            }
            case /^halt$/.test(line):
                return new Instruction(InstructionId.Halt);
        }
        throw new Error(`Unknown instruction: ${line}`);
    }
}
