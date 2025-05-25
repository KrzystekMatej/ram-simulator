import {Instruction, InstructionId} from './instruction';
import {safeParseInteger} from '../../utils/parsing';
import {prefixMethodErrors} from '../../utils/error-handling'

export class Compiler {

    compile(text: string): Instruction[] {
        let instructions: Instruction[] = [];
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.length === 0 || trimmed.startsWith('//')) continue;
            const instruction = prefixMethodErrors(`Chyba na řádku č. ${i}: ${lines[i]} `, this.parseInstruction, this, trimmed);
            instructions.push(instruction);
        }

        if (instructions.length === 0)
            throw new Error('Vložený program je prázdný.');

        if (instructions[0].id !== InstructionId.Init) {
            instructions.unshift(new Instruction(InstructionId.Init, []));

            instructions.forEach((instruction: Instruction) => {
               if (instruction.id === InstructionId.Jump) {
                   instruction.args[0] += 1;
               } else if (instruction.id === InstructionId.CondJumpConstant || instruction.id === InstructionId.CondJumpRegister) {
                   instruction.args[3] += 1;
               }
            });
        }

        if (instructions.filter(x => x.id === InstructionId.Init).length > 1)
            throw new Error('Instrukce \'init\' je zadána vícekrát.');

        if (instructions[instructions.length - 1].id !== InstructionId.Halt)
            instructions.push(new Instruction(InstructionId.Halt));

        return instructions;
    }

    private parseInstruction(line: string): Instruction {
        switch (true) {
            case line.startsWith('init'): {
                const prefix = 'init';
                const rest = line.slice(prefix.length).trim();
                if (!rest.startsWith('[') || !rest.endsWith(']')) {
                    throw new Error('Neplatný formát instrukce \'init\': chybí závorky [] - seznam čísel uložený na vstupní pásku.');
                }

                const contents = rest.slice(1, -1).trim();
                if (contents.length === 0) {
                    return new Instruction(InstructionId.Init, []);
                }

                const parts = contents.split(',').map(s => s.trim());
                const inputs = parts.map(s => safeParseInteger(s));
                return new Instruction(InstructionId.Init, inputs);
            }
            case /^R\d+\s*=\s*\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*(\d+)$/);
                return new Instruction(InstructionId.AssignConst, [safeParseInteger(match![1]), safeParseInteger(match![2])]);
            }
            case /^R\d+\s*=\s*R\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*R(\d+)$/);
                return new Instruction(InstructionId.AssignRegister, [safeParseInteger(match![1]), safeParseInteger(match![2])]);
            }
            case /^R\d+\s*=\s*\[R\d+\]$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*\[R(\d+)\]$/);
                return new Instruction(InstructionId.Load, [safeParseInteger(match![1]), safeParseInteger(match![2])]);
            }
            case /^\[R\d+\]\s*=\s*R\d+$/.test(line): {
                const match = line.match(/^\[R(\d+)\]\s*=\s*R(\d+)$/);
                return new Instruction(InstructionId.Store, [safeParseInteger(match![1]), safeParseInteger(match![2])]);
            }
            case /^R\d+\s*=\s*R\d+\s*[\+\-\*\/]\s*R\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*R(\d+)\s*([\+\-\*\/])\s*R(\d+)$/);
                return new Instruction(InstructionId.ArithmeticRegister, [safeParseInteger(match![1]), safeParseInteger(match![2]), match![3], safeParseInteger(match![4])]);
            }
            case /^R\d+\s*=\s*R\d+\s*[\+\-\*\/]\s*\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*R(\d+)\s*([\+\-\*\/])\s*(\d+)$/);
                return new Instruction(InstructionId.ArithmeticConstant, [safeParseInteger(match![1]), safeParseInteger(match![2]), match![3], safeParseInteger(match![4])]);
            }
            case /^goto\s+\d+$/.test(line): {
                const match = line.match(/^goto\s+(\d+)$/);
                return new Instruction(InstructionId.Jump, [safeParseInteger(match![1])]);
            }
            case /^if\s*\(\s*R\d+\s*(==|!=|<=|>=|<|>)\s*R\d+\s*\)\s*goto\s*\d+$/.test(line): {
                const match = line.match(/^if\s*\(\s*R(\d+)\s*(==|!=|<=|>=|<|>)\s*R(\d+)\s*\)\s*goto\s*(\d+)$/);
                return new Instruction(InstructionId.CondJumpRegister, [safeParseInteger(match![1]), match![2], safeParseInteger(match![3]), safeParseInteger(match![4])]);
            }
            case /^if\s*\(\s*R\d+\s*(==|!=|<=|>=|<|>)\s*\d+\s*\)\s*goto\s*\d+$/.test(line): {
                const match = line.match(/^if\s*\(\s*R(\d+)\s*(==|!=|<=|>=|<|>)\s*(\d+)\s*\)\s*goto\s*(\d+)$/);
                return new Instruction(InstructionId.CondJumpConstant, [safeParseInteger(match![1]), match![2], safeParseInteger(match![3]), safeParseInteger(match![4])]);
            }
            case /^R\d+\s*=\s*READ\(\)$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*READ\(\)$/);
                return new Instruction(InstructionId.Read, [safeParseInteger(match![1])]);
            }
            case /^WRITE\(R\d+\)$/.test(line): {
                const match = line.match(/^WRITE\(R(\d+)\)$/);
                return new Instruction(InstructionId.Write, [safeParseInteger(match![1])]);
            }
            case /^halt$/.test(line):
                return new Instruction(InstructionId.Halt);
        }

        throw new Error(`Neplatná instrukce`);
    }
}
