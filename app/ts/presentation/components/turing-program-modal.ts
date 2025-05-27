
export class TuringProgramModal {
    private readonly modalElement: HTMLElement;
    private readonly modalInstance: any;
    private readonly titleElement: HTMLElement;
    private readonly contentElement: HTMLElement;
    private readonly fallbackFocusSelector: string;

    constructor(modalId: string, fallbackFocusSelector = 'body') {
        this.modalElement = document.getElementById(modalId)!;
        this.modalInstance = new bootstrap.Modal(this.modalElement);

        this.titleElement = this.modalElement.querySelector('.modal-title')!;
        this.contentElement = document.getElementById('turing-full-program-latex')!;

        this.fallbackFocusSelector = fallbackFocusSelector;

        this.modalElement.addEventListener('hidden.bs.modal', () => {
            const fallbackEl = document.querySelector<HTMLElement>(this.fallbackFocusSelector);
            fallbackEl?.focus();
        });
    }

    show(title: string, latexContent: string) {
        this.titleElement.textContent = title;
        this.contentElement.innerHTML = latexContent;
        MathJax.typesetPromise([this.contentElement]);
        this.modalInstance.show();
    }
}