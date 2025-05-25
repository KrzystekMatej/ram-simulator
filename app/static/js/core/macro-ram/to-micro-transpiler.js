import { Instruction as MicroInstruction, InstructionId, InstructionId as MicroInstructionId } from '../micro-ram/instruction.js';
export class ToMicroTranspiler {
    transpile(ramInstructions) {
        let microInstructions = [];
        let indexMap = new Map();
        for (let i = 0; i < ramInstructions.length; i++) {
            indexMap.set(i, microInstructions.length);
            const transpiled = ToMicroTranspiler.handlers[ramInstructions[i].id].apply(this, ramInstructions[i].args);
            microInstructions.push(...transpiled);
        }
        for (const instruction of microInstructions) {
            if (instruction.id === MicroInstructionId.Jump)
                instruction.args[0] = indexMap.get(instruction.args[0]);
            else if (instruction.id === MicroInstructionId.CondJump)
                instruction.args[1] = indexMap.get(instruction.args[1]);
        }
        return [microInstructions, indexMap];
    }
}
ToMicroTranspiler.handlers = [
    function init(...inputs) {
        return [new MicroInstruction(InstructionId.Init, inputs)];
    },
    function assignConst(register, constant) {
        const instructions = [
            new MicroInstruction(MicroInstructionId.AssignConst, [register]),
            new MicroInstruction(MicroInstructionId.AssignC),
            new MicroInstruction(MicroInstructionId.AssignConst, [constant]),
            new MicroInstruction(MicroInstructionId.Store)
        ];
        return instructions;
    },
    function AssignRegister(target, source) {
        const instructions = [
            new MicroInstruction(MicroInstructionId.AssignConst, [target]),
            new MicroInstruction(MicroInstructionId.AssignC),
            new MicroInstruction(MicroInstructionId.AssignConst, [source]),
            new MicroInstruction(MicroInstructionId.Load),
            new MicroInstruction(MicroInstructionId.Store)
        ];
        return instructions;
    },
    function load(register1, register2) {
        const instructions = [
            new MicroInstruction(MicroInstructionId.AssignConst, [register1]),
            new MicroInstruction(MicroInstructionId.AssignC),
            new MicroInstruction(MicroInstructionId.AssignConst, [register2]),
            new MicroInstruction(MicroInstructionId.Load),
            new MicroInstruction(MicroInstructionId.Load),
            new MicroInstruction(MicroInstructionId.Store)
        ];
        return instructions;
    },
    function store(register1, register2) {
        const instructions = [
            new MicroInstruction(MicroInstructionId.AssignConst, [register1]),
            new MicroInstruction(MicroInstructionId.Load),
            new MicroInstruction(MicroInstructionId.AssignC),
            new MicroInstruction(MicroInstructionId.AssignConst, [register2]),
            new MicroInstruction(MicroInstructionId.Load),
            new MicroInstruction(MicroInstructionId.Store)
        ];
        return instructions;
    },
    function ArithmeticRegister(target, operand1, operator, operand2) {
        const instructions = [
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
    function ArithmeticConstant(target, operand1, operator, operand2) {
        const instructions = [
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
    function jump(label) {
        const instructions = [
            new MicroInstruction(MicroInstructionId.Jump, [label]),
        ];
        return instructions;
    },
    function condJumpRegister(operand1, rel, operand2, label) {
        const instructions = [
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
    function condJumpConstant(operand1, rel, operand2, label) {
        const instructions = [
            new MicroInstruction(MicroInstructionId.AssignConst, [operand2]),
            new MicroInstruction(MicroInstructionId.AssignB),
            new MicroInstruction(MicroInstructionId.AssignConst, [operand1]),
            new MicroInstruction(MicroInstructionId.Load),
            new MicroInstruction(MicroInstructionId.Arithmetic, ['-']),
            new MicroInstruction(MicroInstructionId.CondJump, [rel, label])
        ];
        return instructions;
    },
    function read(target) {
        const instructions = [
            new MicroInstruction(MicroInstructionId.AssignConst, [target]),
            new MicroInstruction(MicroInstructionId.AssignC),
            new MicroInstruction(MicroInstructionId.Read),
            new MicroInstruction(MicroInstructionId.Store)
        ];
        return instructions;
    },
    function write(source) {
        const instructions = [
            new MicroInstruction(MicroInstructionId.AssignConst, [source]),
            new MicroInstruction(MicroInstructionId.Load),
            new MicroInstruction(MicroInstructionId.Write)
        ];
        return instructions;
    },
    function halt() {
        const instructions = [
            new MicroInstruction(MicroInstructionId.Halt)
        ];
        return instructions;
    }
];
