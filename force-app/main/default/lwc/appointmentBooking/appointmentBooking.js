import { LightningElement, api, track, wire } from 'lwc';
import getAppointments  from '@salesforce/apex/PatientController.getAppointments';
import saveAppointment  from '@salesforce/apex/PatientController.saveAppointment';
import { refreshApex }  from '@salesforce/apex';

export default class AppointmentBooking extends LightningElement {
    @api patientId;
    @track appointments = [];
    @track newAppt = { Status__c: 'Scheduled', Department__c: 'General' };
    _wiredResult;

    deptOptions = [
        { label: 'General',    value: 'General'    },
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Neurology',  value: 'Neurology'  },
        { label: 'Ortho',      value: 'Ortho'      },
        { label: 'Pediatrics', value: 'Pediatrics' }
    ];

    statusOptions = [
        { label: 'Scheduled',  value: 'Scheduled'  },
        { label: 'Completed',  value: 'Completed'  },
        { label: 'Cancelled',  value: 'Cancelled'  }
    ];

    @wire(getAppointments, { patientId: '$patientId' })
    wiredAppointments(result) {
        this._wiredResult = result;
        if (result.data) {
            this.appointments = result.data.map(a => ({
                ...a,
                statusClass: a.Status__c === 'Scheduled' ? 'badge badge-blue'
                           : a.Status__c === 'Completed'  ? 'badge badge-green'
                           : 'badge badge-red'
            }));
        }
    }

    get noAppointments() {
        return !this.appointments || this.appointments.length === 0;
    }

    handleChange(event) {
        const field = event.currentTarget.dataset.field;
        this.newAppt = { ...this.newAppt, [field]: event.detail.value };
    }

    handleSave() {
        const apptToSave = { ...this.newAppt, Patient__c: this.patientId };
        saveAppointment({ appt: apptToSave })
            .then(() => {
                this.newAppt = { Status__c: 'Scheduled', Department__c: 'General' };
                return refreshApex(this._wiredResult);
            })
            .catch(err => console.error('Save appointment error:', err));
    }
}
