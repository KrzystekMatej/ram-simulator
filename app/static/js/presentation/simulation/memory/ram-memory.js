import { HoldScrollButton } from "../../components/hold-scroll-button.js";
export class UIRamMemory {
    constructor(source, elementId) {
        this.source = source;
        this.memoryElement = document.getElementById(elementId);
        this.startOffset = 0;
        new HoldScrollButton(this.memoryElement.querySelector('.scroll-btn.left'), () => {
            if (this.startOffset >= 0)
                return;
            this.startOffset += 1;
            this.update();
        }, 200, 70);
        new HoldScrollButton(this.memoryElement.querySelector('.scroll-btn.right'), () => {
            this.startOffset -= 1;
            this.update();
        }, 200, 70);
    }
    update() {
        const items = Array.from(this.memoryElement.querySelectorAll(`.memory-item`)).map(item => {
            const address = item.querySelector(".memory-item-address");
            const value = item.querySelector(".memory-item-value");
            if (!address || !value) {
                throw new Error("Chybějící .memory-item-address nebo .memory-item-value v jednom z prvků.");
            }
            return {
                address,
                value
            };
        });
        items.forEach((item, i) => {
            const address = i - this.startOffset;
            const value = this.source.get(address);
            item.address.textContent = address.toString();
            item.value.textContent = value === undefined ? '0' : value.toString();
        });
    }
}
