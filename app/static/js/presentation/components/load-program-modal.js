import { loadFileText } from "../../utils/network.js";
export class LoadProgramModal {
    constructor(modalId) {
        this.resolvePromise = null;
        this.rejectPromise = null;
        this.promiseSettled = false;
        this.currentFileBaseUrl = null;
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            throw new Error(`Modal element with ID "${modalId}" not found.`);
        }
        this.modalElement = modalElement;
        this.modalInstance = new bootstrap.Modal(this.modalElement);
        const selectElement = this.modalElement.querySelector('#program-file-select');
        const previewTextarea = this.modalElement.querySelector('#program-file-preview');
        const confirmButton = this.modalElement.querySelector('#confirm-load-file-button');
        if (!selectElement || !previewTextarea || !confirmButton) {
            throw new Error('Required elements (select, preview, confirm button) not found within the modal.');
        }
        this.selectElement = selectElement;
        this.previewTextarea = previewTextarea;
        this.confirmButton = confirmButton;
        this.boundHandleFileSelectChange = this.handleFileSelectChange.bind(this);
        this.boundHandleConfirm = this.handleConfirm.bind(this);
        this.boundHandleModalHidden = this.handleModalHidden.bind(this);
    }
    show(programTypeKey) {
        this.promiseSettled = false;
        const baseUrlElement = document.getElementById(`${programTypeKey}-programs-base-url-src`);
        if (!baseUrlElement || !baseUrlElement.value) {
            const errorMsg = `Base URL source element for '${programTypeKey}' not found or has no value.`;
            console.error(errorMsg);
            return Promise.reject(new Error(errorMsg));
        }
        this.currentFileBaseUrl = baseUrlElement.value;
        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
            this.resetModalUI();
            this.addEventListeners();
            try {
                this.loadFilesIntoSelectFromDOMData(programTypeKey);
                this.modalInstance.show();
            }
            catch (error) {
                console.error("Error initializing modal or loading file list from DOM:", error);
                this.selectElement.innerHTML = '<option value="" disabled selected>Chyba načítání</option>';
                this.previewTextarea.value = `Chyba při přípravě modálního okna: ${error.message}`;
                this.confirmButton.disabled = true;
                this.modalInstance.show();
                this.promiseSettled = true;
                this.rejectPromise?.(error);
            }
        });
    }
    resetModalUI() {
        this.selectElement.innerHTML = '<option value="" disabled selected>Načítání souborů...</option>';
        this.previewTextarea.value = '';
        this.previewTextarea.placeholder = 'Vyberte soubor pro zobrazení náhledu.';
        this.confirmButton.disabled = true;
    }
    addEventListeners() {
        this.selectElement.addEventListener('change', this.boundHandleFileSelectChange);
        this.confirmButton.addEventListener('click', this.boundHandleConfirm);
        this.modalElement.addEventListener('hidden.bs.modal', this.boundHandleModalHidden, { once: true });
    }
    removeEventListeners() {
        this.selectElement.removeEventListener('change', this.boundHandleFileSelectChange);
        this.confirmButton.removeEventListener('click', this.boundHandleConfirm);
        this.modalElement.removeEventListener('hidden.bs.modal', this.boundHandleModalHidden);
    }
    loadFilesIntoSelectFromDOMData(programTypeKey) {
        const dataElement = document.getElementById(`${programTypeKey}-program-list-data`);
        if (!dataElement || !dataElement.textContent) {
            throw new Error(`Data element script tag ('${programTypeKey}-program-list-data') not found or empty.`);
        }
        let files;
        try {
            files = JSON.parse(dataElement.textContent);
        }
        catch (error) {
            console.error(`Failed to parse JSON from '${programTypeKey}-program-list-data':`, error);
            throw new Error(`Chybný formát dat pro seznam souborů (${programTypeKey}).`);
        }
        if (!Array.isArray(files)) {
            throw new Error(`Data for '${programTypeKey}-program-list-data' is not an array.`);
        }
        if (files.length === 0) {
            this.selectElement.innerHTML = '<option value="" disabled selected>Nebyly nalezeny žádné soubory.</option>';
            this.previewTextarea.placeholder = 'V této složce nebyly nalezeny žádné programy.';
            this.confirmButton.disabled = true;
            return;
        }
        this.selectElement.innerHTML = '<option value="" disabled selected>Vyberte program...</option>';
        files.forEach(file => {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            this.selectElement.appendChild(option);
        });
    }
    async handleFileSelectChange() {
        const selectedFileName = this.selectElement.value;
        if (!selectedFileName || !this.currentFileBaseUrl) {
            this.previewTextarea.value = '';
            this.previewTextarea.placeholder = 'Vyberte soubor pro zobrazení náhledu.';
            this.confirmButton.disabled = true;
            return;
        }
        this.previewTextarea.value = 'Načítání obsahu souboru...';
        this.confirmButton.disabled = true;
        try {
            const fileUrl = `${this.currentFileBaseUrl}${encodeURIComponent(selectedFileName)}`;
            this.previewTextarea.value = await loadFileText(fileUrl);
            this.confirmButton.disabled = false;
        }
        catch (error) {
            console.error("Failed to load file content:", error);
            this.previewTextarea.value = `Chyba při načítání obsahu souboru: ${selectedFileName}\n${error.message}`;
            this.confirmButton.disabled = true;
        }
    }
    handleConfirm() {
        if (this.previewTextarea.value && !this.confirmButton.disabled && this.resolvePromise && !this.promiseSettled) {
            this.promiseSettled = true;
            this.resolvePromise(this.previewTextarea.value);
            this.modalInstance.hide();
        }
        else {
            console.warn("Confirm button clicked but conditions not met (no content, button disabled, or promise already settled).");
        }
    }
    handleModalHidden() {
        if (!this.promiseSettled && this.rejectPromise) {
            this.promiseSettled = true;
            this.rejectPromise(new Error('Modal closed without selection.'));
        }
        this.removeEventListeners();
        this.resolvePromise = null;
        this.rejectPromise = null;
        this.currentFileBaseUrl = null;
    }
}
