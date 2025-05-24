import { TapeId } from "./tape-id";
import { TapeSymbol } from "../tape/symbol";
import { removeWhitespace, splitOnce as splitByFirst } from "../../utils/parsing";
import { Move } from "../tape/move";

export type SymbolWrite =
  | { type: 'literal'; symbol: TapeSymbol }
  | { type: 'fromTape'; sourceTape: TapeId };

export class TapeCondition {
    allowedSymbols: TapeSymbol[];

    constructor(allowedSymbols: TapeSymbol[]) {
        this.allowedSymbols = allowedSymbols;
    }

    matches(symbol: TapeSymbol): boolean {
        return this.allowedSymbols.includes(symbol);
    }

    static wildcard(): TapeCondition {
        return new TapeCondition([TapeSymbol.Wildcard]);
    }

    static only(symbol: TapeSymbol): TapeCondition {
        return new TapeCondition([symbol]);
    }

    static multiple(allowedSymbols: TapeSymbol[]): TapeCondition {
        return new TapeCondition(allowedSymbols);
    }

    toString(pIndex: TapeId): string {
        if (this.allowedSymbols.length === 1 && this.allowedSymbols[0] !== TapeSymbol.Wildcard) {
            return `${TapeId[pIndex]}_(${this.allowedSymbols[0]})`;
        } else {
            return `${TapeId[pIndex]}_(${TapeId[pIndex].toLowerCase()})`;
        }
    }
}

export class TapeAction {
    write: SymbolWrite;
    move: Move;

    constructor (write: SymbolWrite, move: Move) {
        this.write = write;
        this.move = move;
    }

    static fromLiteral(symbol: TapeSymbol, move: Move): TapeAction {
        return new TapeAction({ type: 'literal', symbol }, move);
    }
    
    static fromTape(tapeId: TapeId, move: Move): TapeAction {
        return new TapeAction({ type: 'fromTape', sourceTape: tapeId }, move);
    }

    toString(pIndex: TapeId, condition: TapeCondition): string {
        let value: string;
        if (this.write.type === 'literal') {
            value = `${this.write.symbol}`;
        } else {
            value = `${TapeId[this.write.sourceTape].toLowerCase()}`;
        }
    
        return `${TapeId[pIndex]}_(${value}, ${this.move >= 0 ? '+' : ''}${this.move})`;
    }

}

export class Instruction {
    target: string;
    conditions: TapeCondition[];
    actions: TapeAction[];

    constructor (target: string, conditions: TapeCondition[], actions: TapeAction[]) {
        this.target = target;
        this.conditions = conditions;
        this.actions = actions;
    }

    static createNop(target: string): Instruction {
        const conditions = new Array<TapeCondition>(TapeId.TapeCount);
        const actions = new Array<TapeAction>(TapeId.TapeCount);
      
        for (let i = 0; i < TapeId.TapeCount; i++) {
            conditions[i] = TapeCondition.wildcard();
            actions[i] = TapeAction.fromTape(i, Move.Stay);
        }
      
        return new Instruction(target, conditions, actions);
    }

    static createFromOrderedEntries(target: string, conditionEntries: [TapeId, TapeCondition][], actionEntries: [TapeId, TapeAction][]): Instruction {
        const conditions = new Array<TapeCondition>(TapeId.TapeCount);
        const actions = new Array<TapeAction>(TapeId.TapeCount);

        let conditionIndex = 0;
        let actionIndex = 0;
      
        for (let i = 0; i < TapeId.TapeCount; i++) {
            if (conditionIndex < conditionEntries.length && conditionEntries[conditionIndex][0] === i) {
                conditions[i] = conditionEntries[conditionIndex][1];
                conditionIndex++;
            } else {
                conditions[i] = TapeCondition.wildcard();
            }
        
            if (actionIndex < actionEntries.length && actionEntries[actionIndex][0] === i) {
                actions[i] = actionEntries[actionIndex][1];
                actionIndex++;
            } else {
                actions[i] = TapeAction.fromTape(i, Move.Stay);
            }
        }
      
        return new Instruction(target, conditions, actions);
    }

    toString(source: string): string {
        const relevant: number[] = [];
    
        for (let i = 0; i < TapeId.TapeCount; i++) {
            const cond = this.conditions[i];
            const act = this.actions[i];

            const actIsActive = !(act.write.type === 'fromTape' && act.write.sourceTape === i && act.move === Move.Stay);;
            const condIsActive = !cond.matches(TapeSymbol.Wildcard)
    
            if (actIsActive || condIsActive) relevant.push(i);
        }

        if (relevant.length === 0) return `(${source}) = (${this.target})`;
    
        const conds = relevant
            .map(i => this.conditions[i].toString(i))
            .join(', ');
    
        const acts = relevant
            .map(i => this.actions[i].toString(i, this.conditions[i]))
            .join(', ');

        const constraints: string[] = [];
        const constraintGroups = new Map<string, string[]>();

        for (const i of relevant) {
            const cond = this.conditions[i];
            if (!cond.matches(TapeSymbol.Wildcard) && cond.allowedSymbols.length > 1) {
                const varName = `${TapeId[i]}`.toLowerCase();
                const key = cond.allowedSymbols.join(', ');
                if (!constraintGroups.has(key)) constraintGroups.set(key, []);
                constraintGroups.get(key)!.push(varName);
            }
        }
    
        for (const [domainStr, vars] of constraintGroups.entries()) {
            constraints.push(`${vars.join('|')}_(${domainStr})`);
        }
    
        const constraintSuffix = constraints.length > 0 ? `; ${constraints.join(', ')}` : '';
    
        return `(${source}, ${conds}) = (${this.target}, ${acts})${constraintSuffix}`;
    }

    static fromString(str: string): [string, Instruction] {
        const tapeCount = TapeId.TapeCount;

        str = removeWhitespace(str);
    
        const [transitionPart, constraintPart = ''] = str.split(';');
    
        const [leftSide, rightSide] = transitionPart.split('=').map(s => s.slice(1, -1));

        if (!leftSide.includes(',') && !rightSide.includes(',')) {
            const source = leftSide;
            const target = rightSide;
        
            const conds = Array.from({ length: tapeCount }, () => TapeCondition.wildcard());
            const acts = Array.from({ length: tapeCount }, (_, i) => TapeAction.fromTape(i, Move.Stay));
        
            return [source, new Instruction(target, conds, acts)];
        }
    
        const [source, condsRaw] = splitByFirst(leftSide, ",");
        const [target, actsRaw] = splitByFirst(rightSide, ",");

        const condsRawParts = condsRaw.split('),').map(s => s.trim());
        const actsRawParts = actsRaw.split('),').map(s => s.trim());
        
        const constraints = new Map<string, TapeSymbol[]>();
        if (constraintPart.length > 0) {
            const constraintItems = constraintPart.split('),').map(c => c.trim());
            for (const item of constraintItems) {
                const [vars, symbolsRaw] = item.split('_(');
                const symbols = symbolsRaw.replace(')', '').split(',').map(s => s.trim()) as TapeSymbol[];
                const varNames = vars.split('|').map(v => v.trim());
                for (const v of varNames) {
                    constraints.set(v, symbols);
                }
            }
        }
    
        const conds = Array.from({ length: tapeCount }, () => TapeCondition.wildcard());
        const acts = Array.from({ length: tapeCount }, (_, i) => TapeAction.fromTape(i, Move.Stay));
    
        for (const raw of condsRawParts) {
            const parts = raw.split('_(');
            if (parts.length !== 2) throw new Error(`Invalid condition format: ${raw}`);
        
            const tapeRaw = parts[0];
            const condSymbolRaw = parts[1].replace(')', '');
        
            if (!Array.from({ length: tapeCount }, (_, i) => TapeId[i]).includes(tapeRaw)) {
                throw new Error(`Unknown tape identifier: ${tapeRaw}`);
            }

            const tapeId = TapeId[tapeRaw as keyof typeof TapeId];

            if (Object.values(TapeSymbol).includes(condSymbolRaw as TapeSymbol))
            {
                conds[tapeId] = TapeCondition.only(condSymbolRaw as TapeSymbol);
                continue;
            }

            const refTape = condSymbolRaw.toUpperCase();
        
            if (Array.from({ length: tapeCount }, (_, i) => TapeId[i]).includes(refTape)) {
                const allowed = constraints.get(condSymbolRaw);
                conds[tapeId] = allowed ? new TapeCondition(allowed) : TapeCondition.wildcard();
                continue;
            }

            throw new Error(`Invalid condition symbol: ${condSymbolRaw}`);
        }

        for (const raw of actsRawParts) {
            const parts = raw.split('_(');
            if (parts.length !== 2) throw new Error(`Invalid action format: ${raw}`);

            const tapeRaw = parts[0];
            const actionRaw = parts[1].replace(')', '');
        
            if (!Array.from({ length: tapeCount }, (_, i) => TapeId[i]).includes(tapeRaw)) {
                throw new Error(`Unknown tape identifier in action: ${tapeRaw}`);
            }
            const tapeId = TapeId[tapeRaw as keyof typeof TapeId];
        
            const [writeRaw, moveRaw] = actionRaw.split(',').map(s => s.trim());
            const move = parseInt(moveRaw) as Move;
        
            if (!Object.values(Move).includes(move)) {
                throw new Error(`Invalid move value: ${moveRaw}`);
            }

            if (Object.values(TapeSymbol).includes(writeRaw as TapeSymbol))
            {
                acts[tapeId] = TapeAction.fromLiteral(writeRaw as TapeSymbol, move);
                continue;
            }

            const refTape = writeRaw.toUpperCase();
        
            if (Array.from({ length: tapeCount }, (_, i) => TapeId[i]).includes(refTape)) {
                const sourceTapeId = TapeId[refTape as keyof typeof TapeId];
                acts[tapeId] = TapeAction.fromTape(sourceTapeId, move);
                continue;
            }

            throw new Error(`Invalid write symbol: ${writeRaw}`);
        }
    
        return [source, new Instruction(target, conds, acts)];
    }

    toJSON() {
        return {
            target: this.target,
            conditions: this.conditions.map(c => c.allowedSymbols),
            actions: this.actions.map(a => ({
                write: a.write,
                move: a.move
            }))
        };
    }
    
    static fromJSON(data: any): Instruction {
        const conditions = data.conditions.map(
            (symbols: TapeSymbol[]) => new TapeCondition(symbols)
        );
    
        const actions = data.actions.map(
            (a: { write: SymbolWrite; move: Move }) => new TapeAction(a.write, a.move)
        );
    
        return new Instruction(data.target, conditions, actions);
    }
}