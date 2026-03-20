import { LightningElement, api } from 'lwc';

export default class ConfirmModal extends LightningElement {
    @api title = 'Are you sure?';
    @api message = 'This action cannot be undone.';
    @api confirmLabel = 'Confirm';
    @api isOpen = false;

    handleConfirm() {
        this.dispatchEvent(new CustomEvent('confirm'));
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('cancel'));
    }
}
