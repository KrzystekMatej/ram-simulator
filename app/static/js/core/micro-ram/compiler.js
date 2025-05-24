import { safeParseInteger } from '../../utils/parsing.js';
import { prefixMethodErrors } from '../../utils/error-handling.js';
import { Instruction, InstructionId } from './instruction.js';
export class Compiler {
    compile(text) {
        let instructions = [];
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.length === 0 || trimmed.startsWith('//'))
                continue;
            const instruction = prefixMethodErrors(`Error at line ${i}: ${lines[i]}`, this.parseInstruction, this, trimmed);
            instructions.push(instruction);
        }
        if (instructions[0].id !== InstructionId.Init)
            throw new Error('Missing init instruction at the start');
        const initCount = instructions.filter(x => x.id === InstructionId.Init).length;
        if (initCount > 1)
            throw new Error('Multiple init instructions');
        return instructions;
    }
    parseInstruction(line) {
        switch (true) {
            case line.startsWith('init'): {
                const prefix = 'init';
                const rest = line.slice(prefix.length).trim();
                if (!rest.startsWith('[') || !rest.endsWith(']')) {
                    throw new Error('Invalid init format: missing brackets');
                }
                const contents = rest.slice(1, -1).trim();
                if (contents.length === 0) {
                    return new Instruction(InstructionId.Init, []);
                }
                const parts = contents.split(',').map(s => s.trim());
                const inputs = parts.map(s => safeParseInteger(s));
                return new Instruction(InstructionId.Init, inputs);
            }
            case /^A\s*=\s*\d+$/.test(line): {
                const match = line.match(/^A\s*=\s*(\d+)$/);
                return new Instruction(InstructionId.AssignConst, [safeParseInteger(match[1])]);
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
                return new Instruction(InstructionId.Jump, [safeParseInteger(match[1])]);
            }
            case /^if\s*\(\s*A\s*(==|!=|<=|>=|<|>)\s*0\s*\)\s*goto\s*\d+$/.test(line): {
                const match = line.match(/^if\s*\(\s*A\s*(==|!=|<=|>=|<|>)\s*0\s*\)\s*goto\s*(\d+)$/);
                return new Instruction(InstructionId.CondJump, [match[1], safeParseInteger(match[2])]);
            }
            case /^A\s*=\s*READ\(\)$/.test(line):
                return new Instruction(InstructionId.Read);
            case /^WRITE\(A\)$/.test(line):
                return new Instruction(InstructionId.Write);
            case /^halt$/.test(line):
                return new Instruction(InstructionId.Halt);
        }
        throw new Error("Unknown instruction");
    }
}
