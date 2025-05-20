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
            case /^A\s*=\s*\d+$/.test(line): {
                const match = line.match(/^A\s*=\s*(\d+)$/);
                return new Instruction(InstructionId.AssignConst, [parseInt(match[1])]);
            }
            case /^B\s*=\s*A$/.test(line):
                return new Instruction(InstructionId.AssignB);
            case /^C\s*=\s*A$/.test(line):
                return new Instruction(InstructionId.AssignC);
            case /^A\s*=\s*\[A\]$/.test(line):
                return new Instruction(InstructionId.Load);
            case /^\[C\]\s*=\s*A$/.test(line):
                return new Instruction(InstructionId.Store);
            case /^A\s*=\s*A\s*[\+\-\*\/]\s*B$/.test(line): {
                const match = line.match(/^A\s*=\s*A\s*([\+\-\*\/])\s*B$/);
                return new Instruction(InstructionId.Arithmetic, [match[1]]);
            }
            case /^goto\s+\d+$/.test(line): {
                const match = line.match(/^goto\s+(\d+)$/);
                return new Instruction(InstructionId.Jump, [parseInt(match[1])]);
            }
            case /^if\s*\(\s*A\s*(==|!=|<=|>=|<|>)\s*0\s*\)\s*goto\s*\d+$/.test(line): {
                const match = line.match(/^if\s*\(\s*A\s*(==|!=|<=|>=|<|>)\s*0\s*\)\s*goto\s*(\d+)$/);
                return new Instruction(InstructionId.CondJump, [match[1], parseInt(match[2])]);
            }
            case /^A\s*=\s*READ\(\)$/.test(line):
                return new Instruction(InstructionId.Read);
            case /^WRITE\(A\)$/.test(line):
                return new Instruction(InstructionId.Write);
            case /^halt$/.test(line):
                return new Instruction(InstructionId.Halt);
        }
        throw new Error(`Unknown instruction: ${line}`);
    }
}
