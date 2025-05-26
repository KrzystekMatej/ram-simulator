import {Tape} from "../../../core/tape/tape";
import {intDiv} from "../../../utils/math";
import { TapeSymbol} from "../../../core/tape/symbol";
import {HoldScrollButton} from "../../components/hold-scroll-button";

export class UISymbolTape {
    headOffset: number;
    tapeElement: HTMLElement;

    source: Tape<TapeSymbol>;

    constructor(source: Tape<TapeSymbol>, elementId: string) {
        this.source = source;
        this.tapeElement = document.getElementById(elementId) as HTMLElement;
        this.headOffset = 0;

        new HoldScrollButton(this.tapeElement.querySelector<HTMLButtonElement>('.scroll-btn.left')!,
            () => {
                this.headOffset += 1;
                this.update();
            }, 200, 70
        );

        new HoldScrollButton(this.tapeElement.querySelector<HTMLButtonElement>('.scroll-btn.right')!,
            () => {
                this.headOffset -= 1;
                this.update();
            }, 200, 70
        );
    }

    update() : void {
        const items = this.tapeElement.querySelectorAll<HTMLElement>('.tape-item');

        const middleElementPos = intDiv(items.length, 2);
        const tapeContents = this.source.getSegments(this.source.tell() - this.headOffset, middleElementPos, items.length - middleElementPos - 1);

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