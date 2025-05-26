
export class HoldScrollButton {
    readonly btn: HTMLElement;
    private readonly step: () => void;
    private delayTimer: number | null = null;
    private holdTimer: number | null = null;
    private readonly delay: number;
    private readonly interval: number;

    constructor(btn: HTMLElement, step: () => void, delay = 200, interval = 120) {
        this.btn      = btn;
        this.step     = step;
        this.delay    = delay;
        this.interval = interval;

        this.attachEvents();
    }

    private attachEvents() {
        this.btn.addEventListener('pointerdown', e => {
            e.preventDefault();
            this.startHold();
        });

        ['pointerup', 'pointerleave', 'pointercancel']
            .forEach(type => this.btn.addEventListener(type, () => this.stopHold()));
    }

    private startHold() {
        this.step();

        this.delayTimer = window.setTimeout(() => {
            this.holdTimer = window.setInterval(() => this.step(), this.interval);
        }, this.delay);
    }

    private stopHold() {
        if (this.delayTimer !== null) {
            clearTimeout(this.delayTimer);
            this.delayTimer = null;
        }
        if (this.holdTimer !== null) {
            clearInterval(this.holdTimer);
            this.holdTimer = null;
        }
    }
}