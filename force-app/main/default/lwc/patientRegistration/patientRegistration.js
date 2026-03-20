import { LightningElement, track } from 'lwc';
import savePatient from '@salesforce/apex/PatientController.savePatient';

export default class PatientRegistration extends LightningElement {
    @track patient = {
        Name: '', Date_of_Birth__c: '', Gender__c: '',
        Blood_Group__c: '', Phone__c: '', Email__c: '',
        Address__c: '', Status__c: 'Active'
    };
    @track errorMessage = '';
    @track isSaving = false;

    genderOptions = [
        { label: 'Male',   value: 'Male'   },
        { label: 'Female', value: 'Female' },
        { label: 'Other',  value: 'Other'  }
    ];

    bloodGroupOptions = [
        { label: 'A+',  value: 'A+'  }, { label: 'A-',  value: 'A-'  },
        { label: 'B+',  value: 'B+'  }, { label: 'B-',  value: 'B-'  },
        { label: 'O+',  value: 'O+'  }, { label: 'O-',  value: 'O-'  },
        { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' }
    ];

    statusOptions = [
        { label: 'Active',     value: 'Active'     },
        { label: 'Inactive',   value: 'Inactive'   },
        { label: 'Discharged', value: 'Discharged' }
    ];

    handleChange(event) {
        const field = event.currentTarget.dataset.field;
        this.patient = { ...this.patient, [field]: event.detail.value };
    }

    handleSave() {
        // basic validation
        if (!this.patient.Name) {
            this.errorMessage = 'Patient name is required.';
            return;
        }
        this.isSaving = true;
        this.errorMessage = '';

        savePatient({ patient: this.patient })
            .then(result => {
                this.isSaving = false;
                // fire event to parent to close form and refresh list
                this.dispatchEvent(new CustomEvent('patientsaved', {
                    detail: { id: result.Id, name: result.Name }
                }));
                this.resetForm();
            })
            .catch(err => {
                this.isSaving = false;
                this.errorMessage = err.body.message || 'Error saving patient.';
            });
    }

    handleCancel() {
        this.resetForm();
        this.dispatchEvent(new CustomEvent('cancel'));
    }

    resetForm() {
        this.patient = {
            Name: '', Date_of_Birth__c: '', Gender__c: '',
            Blood_Group__c: '', Phone__c: '', Email__c: '',
            Address__c: '', Status__c: 'Active'
        };
        this.errorMessage = '';
    }
}
