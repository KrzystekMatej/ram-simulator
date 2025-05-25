import { intDiv } from "../../../utils/math.js";
import { TapeSymbol } from "../../../core/tape/symbol.js";
export class UINumberTape {
    constructor(source, elementId) {
        this.source = source;
        this.tapeElement = document.getElementById(elementId);
        this.headOffset = 0;
        this.tapeElement.querySelector('.scroll-btn.left')?.addEventListener('click', () => {
            this.headOffset += 1;
            this.update();
        });
        this.tapeElement.querySelector('.scroll-btn.right')?.addEventListener('click', () => {
            this.headOffset -= 1;
            this.update();
        });
    }
    update() {
        const items = this.tapeElement.querySelectorAll('.tape-item');
        const middleElementPos = intDiv(items.length, 2);
        const tapeContents = this.source.getSegments(this.headOffset + this.source.tell(), middleElementPos, items.length - middleElementPos - 1)
            .map((item) => item === undefined ? TapeSymbol.Blank : item.toString());
        const headElementPos = middleElementPos + this.headOffset;
        items.forEach((item, i) => {
            item.textContent = tapeContents[i];
            if (i === headElementPos) {
                item?.parentElement?.classList.add("tape-head");
            }
            else {
                item?.parentElement?.classList.remove("tape-head");
            }
        });
    }
}
