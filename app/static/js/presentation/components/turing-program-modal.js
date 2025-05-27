export class TuringProgramModal {
    constructor(modalId, fallbackFocusSelector = 'body') {
        this.modalElement = document.getElementById(modalId);
        this.modalInstance = new bootstrap.Modal(this.modalElement);
        this.titleElement = this.modalElement.querySelector('.modal-title');
        this.contentElement = document.getElementById('turing-full-program-latex');
        this.fallbackFocusSelector = fallbackFocusSelector;
        this.modalElement.addEventListener('hidden.bs.modal', () => {
            const fallbackEl = document.querySelector(this.fallbackFocusSelector);
            fallbackEl?.focus();
        });
    }
    show(title, latexContent) {
        this.titleElement.textContent = title;
        this.contentElement.innerHTML = latexContent;
        MathJax.typesetPromise([this.contentElement]);
        this.modalInstance.show();
    }
}
