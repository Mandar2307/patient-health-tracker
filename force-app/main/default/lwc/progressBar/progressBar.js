import { LightningElement, api } from 'lwc';

export default class ProgressBar extends LightningElement {
    @api currentStep = 1;
    @api steps = ['Step 1', 'Step 2', 'Step 3', 'Step 4'];

    // computed — build step objects with state info
    get stepsWithState() {
        return this.steps.map((label, index) => {
            const num = index + 1;
            return {
                label,
                number: num,
                isCompleted: num < this.currentStep,
                isActive:    num === this.currentStep,
                isPending:   num > this.currentStep,
                cssClass:    num < this.currentStep  ? 'step completed'
                           : num === this.currentStep ? 'step active'
                           :                            'step pending'
            };
        });
    }

    // computed — width of the filled progress bar
    get progressStyle() {
        const pct = ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
        return `width: ${Math.max(0, Math.min(100, pct))}%`;
    }

    handleStepClick(event) {
        const step = Number(event.currentTarget.dataset.step);
        // only allow clicking back to completed steps
        if (step <= this.currentStep) {
            this.dispatchEvent(new CustomEvent('stepchange', {
                detail: { step }
            }));
        }
    }
}
