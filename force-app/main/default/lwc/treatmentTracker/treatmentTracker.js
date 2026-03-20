import { LightningElement, api, track, wire } from 'lwc';
import getTreatments   from '@salesforce/apex/PatientController.getTreatments';
import saveTreatment   from '@salesforce/apex/PatientController.saveTreatment';
import saveMedicine    from '@salesforce/apex/PatientController.saveMedicine';
import { refreshApex } from '@salesforce/apex';

export default class TreatmentTracker extends LightningElement {
    @api patientId;
    @track treatments = [];
    @track newTreatment = { Status__c: 'Ongoing' };
    _newMedicines = {};  // keyed by treatmentId
    _wiredResult;

    treatStatusOptions = [
        { label: 'Ongoing',   value: 'Ongoing'   },
        { label: 'Completed', value: 'Completed' },
        { label: 'On Hold',   value: 'On Hold'   }
    ];

    freqOptions = [
        { label: 'Once daily',   value: 'Once daily'   },
        { label: 'Twice daily',  value: 'Twice daily'  },
        { label: 'Thrice daily', value: 'Thrice daily' },
        { label: 'Weekly',       value: 'Weekly'       }
    ];

    @wire(getTreatments, { patientId: '$patientId' })
    wiredTreatments(result) {
        this._wiredResult = result;
        if (result.data) {
            this.treatments = result.data.map(t => ({
                ...t,
                statusClass: t.Status__c === 'Ongoing'   ? 'badge badge-blue'
                           : t.Status__c === 'Completed'  ? 'badge badge-green'
                           : 'badge badge-amber'
            }));
        }
    }

    get noTreatments() {
        return !this.treatments || this.treatments.length === 0;
    }

    handleTreatChange(event) {
        const field = event.currentTarget.dataset.field;
        this.newTreatment = { ...this.newTreatment, [field]: event.detail.value };
    }

    saveTreatment() {
        const treatToSave = { ...this.newTreatment, Patient__c: this.patientId };
        saveTreatment({ treatment: treatToSave })
            .then(() => {
                this.newTreatment = { Status__c: 'Ongoing' };
                return refreshApex(this._wiredResult);
            })
            .catch(err => console.error('Save treatment error:', err));
    }

    handleMedChange(event) {
        const treatId = event.currentTarget.dataset.treatid;
        const field   = event.currentTarget.dataset.field;
        if (!this._newMedicines[treatId]) this._newMedicines[treatId] = {};
        this._newMedicines[treatId][field] = event.detail.value;
    }

    saveMedicine(event) {
        const treatId = event.currentTarget.dataset.treatid;
        const medData = this._newMedicines[treatId] || {};
        if (!medData.Medicine_Name__c) return;

        const medToSave = { ...medData, Treatment__c: treatId };
        saveMedicine({ medicine: medToSave })
            .then(() => {
                this._newMedicines[treatId] = {};
                return refreshApex(this._wiredResult);
            })
            .catch(err => console.error('Save medicine error:', err));
    }
}
