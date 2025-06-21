import { Instruction, InstructionId } from './instruction.js';
import { safeParseInteger } from '../../utils/parsing.js';
import { prefixMethodErrors } from '../../utils/error-handling.js';
import { invertMap } from "../../utils/collections.js";
export class Compiler {
    compile(text) {
        let instructions = [];
        const labelMap = new Map();
        const lines = text.split('\n');
        let instrIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            let trimmedLine = lines[i].trim();
            const commentStart = trimmedLine.indexOf('//');
            if (commentStart !== -1)
                trimmedLine = trimmedLine.slice(0, commentStart).trim();
            lines[i] = trimmedLine;
            if (trimmedLine === '')
                continue;
            if (trimmedLine.endsWith(':')) {
                const label = trimmedLine.slice(0, -1).trim();
                if (!label.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/))
                    throw new Error(`Neplatný název návěstí na řádku č. ${i} - ${label}`);
                if (labelMap.has(label))
                    throw new Error(`Duplikované návěstí '${label}' na řádku č. ${i}`);
                labelMap.set(label, instrIndex);
            }
            else {
                instrIndex++;
            }
        }
        for (let i = 0; i < lines.length; i++) {
            const originalLine = lines[i];
            if (originalLine === '' || originalLine.endsWith(':'))
                continue;
            const lineResolved = originalLine.replace(/\bgoto\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, label) => {
                if (!labelMap.has(label))
                    throw new Error(`Návěstí '${label}' není definováno`);
                return `goto ${labelMap.get(label)}`;
            }).replace(/\bgoto\s*\(([^)]*)\)/g, (match, inner) => match);
            const instruction = prefixMethodErrors(`Chyba na řádku č. ${i}: ${originalLine} - `, this.parseInstruction, this, lineResolved);
            if (instruction.id === InstructionId.Jump) {
                const target = instruction.args[0];
                if (typeof target !== 'number' || target < 0 || target >= instrIndex) {
                    throw new Error(`Chyba na řádku č. ${i}: ${originalLine} - Skok na neplatné návěstí nebo index.`);
                }
            }
            else if (instruction.id === InstructionId.CondJumpConstant || instruction.id === InstructionId.CondJumpRegister) {
                const target = instruction.args[3];
                if (typeof target !== 'number' || target < 0 || target >= instrIndex) {
                    throw new Error(`Chyba na řádku č. ${i}: ${originalLine} - Skok na neplatné návěstí nebo index.`);
                }
            }
            instructions.push(instruction);
        }
        if (instructions.length === 0) {
            throw new Error('Vložený program je prázdný.');
        }
        if (instructions[0].id !== InstructionId.Init) {
            throw new Error('Program nezačíná instrukcí init.');
        }
        if (instructions.filter(x => x.id === InstructionId.Init).length > 1)
            throw new Error('Instrukce \'init\' je zadána vícekrát.');
        if (instructions[instructions.length - 1].id !== InstructionId.Halt)
            instructions.push(new Instruction(InstructionId.Halt));
        return [instructions, invertMap(labelMap)];
    }
    parseInstruction(line) {
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
                return new Instruction(InstructionId.AssignConst, [safeParseInteger(match[1]), safeParseInteger(match[2])]);
            }
            case /^R\d+\s*=\s*R\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*R(\d+)$/);
                return new Instruction(InstructionId.AssignRegister, [safeParseInteger(match[1]), safeParseInteger(match[2])]);
            }
            case /^R\d+\s*=\s*\[R\d+\]$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*\[R(\d+)\]$/);
                return new Instruction(InstructionId.Load, [safeParseInteger(match[1]), safeParseInteger(match[2])]);
            }
            case /^\[R\d+\]\s*=\s*R\d+$/.test(line): {
                const match = line.match(/^\[R(\d+)\]\s*=\s*R(\d+)$/);
                return new Instruction(InstructionId.Store, [safeParseInteger(match[1]), safeParseInteger(match[2])]);
            }
            case /^R\d+\s*=\s*R\d+\s*[\+\-\*\/]\s*R\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*R(\d+)\s*([\+\-\*\/])\s*R(\d+)$/);
                return new Instruction(InstructionId.ArithmeticRegister, [safeParseInteger(match[1]), safeParseInteger(match[2]), match[3], safeParseInteger(match[4])]);
            }
            case /^R\d+\s*=\s*R\d+\s*[\+\-\*\/]\s*\d+$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*R(\d+)\s*([\+\-\*\/])\s*(\d+)$/);
                return new Instruction(InstructionId.ArithmeticConstant, [safeParseInteger(match[1]), safeParseInteger(match[2]), match[3], safeParseInteger(match[4])]);
            }
            case /^goto\s+\d+$/.test(line): {
                const match = line.match(/^goto\s+(\d+)$/);
                return new Instruction(InstructionId.Jump, [safeParseInteger(match[1])]);
            }
            case /^if\s*\(\s*R\d+\s*(==|!=|<=|>=|<|>)\s*R\d+\s*\)\s*goto\s*\d+$/.test(line): {
                const match = line.match(/^if\s*\(\s*R(\d+)\s*(==|!=|<=|>=|<|>)\s*R(\d+)\s*\)\s*goto\s*(\d+)$/);
                return new Instruction(InstructionId.CondJumpRegister, [safeParseInteger(match[1]), match[2], safeParseInteger(match[3]), safeParseInteger(match[4])]);
            }
            case /^if\s*\(\s*R\d+\s*(==|!=|<=|>=|<|>)\s*\d+\s*\)\s*goto\s*\d+$/.test(line): {
                const match = line.match(/^if\s*\(\s*R(\d+)\s*(==|!=|<=|>=|<|>)\s*(\d+)\s*\)\s*goto\s*(\d+)$/);
                return new Instruction(InstructionId.CondJumpConstant, [safeParseInteger(match[1]), match[2], safeParseInteger(match[3]), safeParseInteger(match[4])]);
            }
            case /^R\d+\s*=\s*READ\(\)$/.test(line): {
                const match = line.match(/^R(\d+)\s*=\s*READ\(\)$/);
                return new Instruction(InstructionId.Read, [safeParseInteger(match[1])]);
            }
            case /^WRITE\(R\d+\)$/.test(line): {
                const match = line.match(/^WRITE\(R(\d+)\)$/);
                return new Instruction(InstructionId.Write, [safeParseInteger(match[1])]);
            }
            case /^halt$/.test(line):
                return new Instruction(InstructionId.Halt);
        }
        throw new Error(`Neplatná instrukce`);
    }
}
