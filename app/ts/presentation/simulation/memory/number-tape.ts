import {Tape} from "../../../core/tape/tape";
import {intDiv} from "../../../utils/math";
import { TapeSymbol} from "../../../core/tape/symbol";

export class UINumberTape {
    headOffset: number;
    tapeElement: HTMLElement;

    source: Tape<number | undefined>;

    constructor(source: Tape<number | undefined>, elementId: string) {
        this.source = source;
        this.tapeElement = document.getElementById(elementId) as HTMLElement;
        this.headOffset = 0;

        this.tapeElement.querySelector<HTMLButtonElement>('.scroll-btn.left')?.addEventListener('click', () => {
            this.headOffset += 1;
            this.update();
        });

        this.tapeElement.querySelector<HTMLButtonElement>('.scroll-btn.right')?.addEventListener('click', () => {
            this.headOffset -= 1;
            this.update();
        });
    }

    update() : void {
        const items = this.tapeElement.querySelectorAll<HTMLElement>('.tape-item');

        const middleElementPos = intDiv(items.length, 2);
        const tapeContents = this.source.getSegments(this.headOffset + this.source.tell(), middleElementPos, items.length - middleElementPos - 1)
            .map((item) => item === undefined ? TapeSymbol.Blank : item.toString()
        );

        const headElementPos = middleElementPos + this.headOffset;

        items.forEach((item, i) => {
            item.textContent = tapeContents[i];
            if (i === headElementPos) {
                item?.parentElement?.classList.add("tape-head");
            } else {
                item?.parentElement?.classList.remove("tape-head");
            }
        });
    }
}