export class MessageModal {
    readonly modalElement: HTMLElement;
    private readonly modalInstance: any;
    private readonly fallbackFocusSelector: string;

    constructor(modalId: string, fallbackFocusSelector = 'body') {
        this.modalElement = document.getElementById(modalId)!;
        this.modalInstance = new bootstrap.Modal(this.modalElement);

        this.fallbackFocusSelector = fallbackFocusSelector;

        this.modalElement.addEventListener('hidden.bs.modal', () => {
            const fallbackEl = document.querySelector<HTMLElement>(this.fallbackFocusSelector);
            fallbackEl?.focus();
        });
    }

    show(message: string) {
        const body = this.modalElement.querySelector('.modal-body') as HTMLElement;
        body.textContent = message;
        this.modalInstance.show();
    }
}