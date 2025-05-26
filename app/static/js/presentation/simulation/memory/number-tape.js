import { intDiv } from "../../../utils/math.js";
import { TapeSymbol } from "../../../core/tape/symbol.js";
import { HoldScrollButton } from "../../components/hold-scroll-button.js";
export class UINumberTape {
    constructor(source, elementId) {
        this.source = source;
        this.tapeElement = document.getElementById(elementId);
        this.headOffset = 0;
        new HoldScrollButton(this.tapeElement.querySelector('.scroll-btn.left'), () => {
            this.headOffset += 1;
            this.update();
        }, 200, 70);
        new HoldScrollButton(this.tapeElement.querySelector('.scroll-btn.right'), () => {
            this.headOffset -= 1;
            this.update();
        }, 200, 70);
    }
    update() {
        const items = this.tapeElement.querySelectorAll('.tape-item');
        const middleElementPos = intDiv(items.length, 2);
        const tapeContents = this.source.getSegments(this.source.tell() - this.headOffset, middleElementPos, items.length - middleElementPos - 1)
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
