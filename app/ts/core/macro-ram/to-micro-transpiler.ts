import {
    Instruction as MicroInstruction,
    InstructionId,
    InstructionId as MicroInstructionId
} from '../micro-ram/instruction';
import {Instruction as MacroInstruction} from './instruction';
import {invertMap} from "../../utils/collections";

export class ToMicroTranspiler {


    static readonly handlers: ((this: ToMicroTranspiler, ...args: any[]) => MicroInstruction[])[] = [
        function init(...inputs: number[]) {
            return [new MicroInstruction(InstructionId.Init, inputs)];
        },
        function assignConst(register: number, constant: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.AssignConst, [register]),
                new MicroInstruction(MicroInstructionId.AssignC),
                new MicroInstruction(MicroInstructionId.AssignConst, [constant]),
                new MicroInstruction(MicroInstructionId.Store)
            ];

            return instructions;
        },
        function AssignRegister(target: number, source: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.AssignConst, [target]),
                new MicroInstruction(MicroInstructionId.AssignC),
                new MicroInstruction(MicroInstructionId.AssignConst, [source]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.Store)
            ];

            return instructions;
        },
        function load(register1: number, register2: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.AssignConst, [register1]),
                new MicroInstruction(MicroInstructionId.AssignC),
                new MicroInstruction(MicroInstructionId.AssignConst, [register2]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.Store)
            ];

            return instructions;
        },
        function store(register1: number, register2: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.AssignConst, [register1]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.AssignC),
                new MicroInstruction(MicroInstructionId.AssignConst, [register2]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.Store)
            ];

            return instructions;
        },
        function ArithmeticRegister(target: number, operand1: number, operator: string, operand2: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.AssignConst, [target]),
                new MicroInstruction(MicroInstructionId.AssignC),
                new MicroInstruction(MicroInstructionId.AssignConst, [operand2]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.AssignConst, [operand1]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.Arithmetic, [operator]),
                new MicroInstruction(MicroInstructionId.Store)
            ];

            return instructions;
        },
        function ArithmeticConstant(target: number, operand1: number, operator: string, operand2: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.AssignConst, [target]),
                new MicroInstruction(MicroInstructionId.AssignC),
                new MicroInstruction(MicroInstructionId.AssignConst, [operand2]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.AssignConst, [operand1]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.Arithmetic, [operator]),
                new MicroInstruction(MicroInstructionId.Store)
            ];

            return instructions;
        },
        function jump(label: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.Jump, [label]),
            ];

            return instructions;
        },
        function condJumpRegister(operand1: number, rel: string, operand2: number, label: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.AssignConst, [operand2]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.AssignConst, [operand1]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.Arithmetic, ['-']),
                new MicroInstruction(MicroInstructionId.CondJump, [rel, label])
            ];

            return instructions;
        },
        function condJumpConstant(operand1: number, rel: string, operand2: number, label: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.AssignConst, [operand2]),
                new MicroInstruction(MicroInstructionId.AssignB),
                new MicroInstruction(MicroInstructionId.AssignConst, [operand1]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.Arithmetic, ['-']),
                new MicroInstruction(MicroInstructionId.CondJump, [rel, label])
            ];

            return instructions;
        },
        function read(target: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.AssignConst, [target]),
                new MicroInstruction(MicroInstructionId.AssignC),
                new MicroInstruction(MicroInstructionId.Read),
                new MicroInstruction(MicroInstructionId.Store)
            ];

            return instructions;
        },
        function write(source: number) {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.AssignConst, [source]),
                new MicroInstruction(MicroInstructionId.Load),
                new MicroInstruction(MicroInstructionId.Write)
            ];

            return instructions;
        },
        function halt() {
            const instructions: MicroInstruction[] = [
                new MicroInstruction(MicroInstructionId.Halt)
            ];

            return instructions;
        }
    ];


    transpile(ramInstructions: MacroInstruction[]): [MicroInstruction[], Map<number, number>] {
        let microInstructions: MicroInstruction[] = []
        let indexMap: Map<number, number> = new Map();
        let microMacroMap: Map<number, number> = new Map();


        for (let i = 0; i < ramInstructions.length; i++)
        {
            const transpiled: MicroInstruction[] = ToMicroTranspiler.handlers[ramInstructions[i].id].apply(this, ramInstructions[i].args);

            indexMap.set(i, microInstructions.length);
            for (let j = 0; j < transpiled.length; j++) {
                microMacroMap.set(microInstructions.length + j, i);
            }

            microInstructions.push(...transpiled);
        }

        for (const instruction of microInstructions)
        {
            if (instruction.id === MicroInstructionId.Jump)
                instruction.args[0] = indexMap.get(instruction.args[0]);
            else if (instruction.id === MicroInstructionId.CondJump)
                instruction.args[1] = indexMap.get(instruction.args[1]);
        }

        return [microInstructions, microMacroMap];
    }
}
