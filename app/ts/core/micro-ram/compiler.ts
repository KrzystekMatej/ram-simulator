import { safeParseInteger } from '../../utils/parsing';
import { prefixMethodErrors } from '../../utils/error-handling';
import { Instruction, InstructionId} from './instruction';

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
               } else if (instruction.id === InstructionId.CondJump) {
                   instruction.args[1] += 1;
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
            case /^A\s*=\s*\d+$/.test(line): {
                const match = line.match(/^A\s*=\s*(\d+)$/);
                return new Instruction(InstructionId.AssignConst, [safeParseInteger(match![1])]);
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
                return new Instruction(InstructionId.Arithmetic, [match![1]]);
            }
            case /^goto\s+\d+$/.test(line): {
                const match = line.match(/^goto\s+(\d+)$/);
                return new Instruction(InstructionId.Jump, [safeParseInteger(match![1])]);
            }
            case /^if\s*\(\s*A\s*(==|!=|<=|>=|<|>)\s*0\s*\)\s*goto\s*\d+$/.test(line): {
                const match = line.match(/^if\s*\(\s*A\s*(==|!=|<=|>=|<|>)\s*0\s*\)\s*goto\s*(\d+)$/);
                return new Instruction(InstructionId.CondJump, [match![1], safeParseInteger(match![2])]);
            }
            case /^A\s*=\s*READ\(\)$/.test(line):
                return new Instruction(InstructionId.Read);
            case /^WRITE\(A\)$/.test(line):
                return new Instruction(InstructionId.Write);
            case /^halt$/.test(line):
                return new Instruction(InstructionId.Halt);
        }

        throw new Error("Neplatná instrukce");
    }
}
