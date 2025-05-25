export class MessageModal {
    constructor(modalId, fallbackFocusSelector = 'body') {
        this.modalElement = document.getElementById(modalId);
        this.modalInstance = new bootstrap.Modal(this.modalElement);
        this.fallbackFocusSelector = fallbackFocusSelector;
        this.modalElement.addEventListener('hidden.bs.modal', () => {
            const fallbackEl = document.querySelector(this.fallbackFocusSelector);
            fallbackEl?.focus();
        });
    }
    show(message) {
        const body = this.modalElement.querySelector('.modal-body');
        body.textContent = message;
        this.modalInstance.show();
    }
}
