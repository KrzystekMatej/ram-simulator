export class HoldScrollButton {
    constructor(btn, step, delay = 200, interval = 120) {
        this.delayTimer = null;
        this.holdTimer = null;
        this.btn = btn;
        this.step = step;
        this.delay = delay;
        this.interval = interval;
        this.attachEvents();
    }
    attachEvents() {
        this.btn.addEventListener('pointerdown', e => {
            e.preventDefault();
            this.startHold();
        });
        ['pointerup', 'pointerleave', 'pointercancel']
            .forEach(type => this.btn.addEventListener(type, () => this.stopHold()));
    }
    startHold() {
        this.step();
        this.delayTimer = window.setTimeout(() => {
            this.holdTimer = window.setInterval(() => this.step(), this.interval);
        }, this.delay);
    }
    stopHold() {
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
