
export class UIRamMemory {
    startOffset: number;
    memoryElement: HTMLElement;

    source: Map<number, number>;

    constructor(source: Map<number, number>, elementId: string) {
        this.source = source;
        this.memoryElement = document.getElementById(elementId) as HTMLElement;

        this.memoryElement.querySelector<HTMLButtonElement>('.scroll-btn.left')?.addEventListener('click', () => {
            if (this.startOffset > 0) return;
            this.startOffset += 1;
            this.update();
        });

        this.memoryElement.querySelector<HTMLButtonElement>('.scroll-btn.right')?.addEventListener('click', () => {
            this.startOffset -= 1;
            this.update();
        });

        this.startOffset = 0;
    }

    update() : void {

        const items: { address: HTMLElement; value: HTMLElement }[] = Array.from(
                this.memoryElement.querySelectorAll<HTMLElement>(`.memory-item`)
            ).map(item => {
                const address = item.querySelector(".memory-item-address") as HTMLElement;
                const value = item.querySelector(".memory-item-value") as HTMLElement;

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