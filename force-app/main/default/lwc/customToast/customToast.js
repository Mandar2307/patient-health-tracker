import { LightningElement, track } from 'lwc';

export default class CustomToast extends LightningElement {
    @track toasts = [];

    // Call this from any parent component
    // Types: 'success', 'error', 'warning', 'info'
    show(message, type = 'success') {
        const id = Date.now();
        const iconMap = { success: '✓', error: '✕', warning: '!', info: 'i' };
        this.toasts = [...this.toasts, {
            id,
            message,
            icon: iconMap[type] || '✓',
            cssClass: `toast toast-${type}`
        }];
        // auto dismiss after 3 seconds
        setTimeout(() => {
            this.removeToast(id);
        }, 3000);
    }

    dismiss(event) {
        const id = Number(event.currentTarget.dataset.id);
        this.removeToast(id);
    }

    removeToast(id) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }
}
