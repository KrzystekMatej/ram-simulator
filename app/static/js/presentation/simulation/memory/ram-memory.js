export class UIRamMemory {
    constructor(source, elementId) {
        this.source = source;
        this.memoryElement = document.getElementById(elementId);
        this.memoryElement.querySelector('.scroll-btn.left')?.addEventListener('click', () => {
            if (this.startOffset > 0)
                return;
            this.startOffset += 1;
            this.update();
        });
        this.memoryElement.querySelector('.scroll-btn.right')?.addEventListener('click', () => {
            this.startOffset -= 1;
            this.update();
        });
        this.startOffset = 0;
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
            const address = this.startOffset + i;
            const value = this.source.get(address);
            item.address.textContent = address.toString();
            item.value.textContent = value === undefined ? '0' : value.toString();
        });
    }
}
