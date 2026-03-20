import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getDashboardStats from '@salesforce/apex/PatientController.getDashboardStats';
import getPatients      from '@salesforce/apex/PatientController.getPatients';
import getAppointmentsByDepartment from '@salesforce/apex/PatientController.getAppointmentsByDepartment';

export default class PatientDashboard extends NavigationMixin(LightningElement) {
    @track stats = { totalPatients: 0, activePatients: 0, todayAppointments: 0, ongoingTreatments: 0 };
    @track patients = [];
    @track showRegistration = false;
    _searchTimer;

    // load stats on component load
    @wire(getDashboardStats)
    wiredStats({ data, error }) {
        if (data) this.stats = data;
        if (error) console.error('Stats error:', error);
    }

    // load all patients on component load
    connectedCallback() {
        this.loadPatients('');
        this.loadChart();
    }

    loadPatients(searchTerm) {
        getPatients({ searchTerm })
            .then(data => {
                // add statusClass for badge color
                this.patients = data.map(p => ({
                    ...p,
                    statusClass: p.Status__c === 'Active'     ? 'badge badge-active'
                               : p.Status__c === 'Discharged' ? 'badge badge-grey'
                               : 'badge badge-inactive'
                }));
            })
            .catch(err => console.error('Patient load error:', err));
    }

    handleSearch(event) {
        const term = event.target.value;
        clearTimeout(this._searchTimer);
        this._searchTimer = setTimeout(() => this.loadPatients(term), 300);
    }

    get noPatients() {
        return !this.patients || this.patients.length === 0;
    }

    openRegistration() {
        this.showRegistration = true;
    }

    viewPatient(event) {
        const patientId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: { recordId: patientId, objectApiName: 'Patient__c', actionName: 'view' }
        });
    }

    openPdfReport(event) {
        const patientId = event.currentTarget.dataset.id;
        // open PDF in new tab
        window.open('/apex/PatientHealthReport?id=' + patientId, '_blank');
    }

    loadChart() {
        getAppointmentsByDepartment()
            .then(data => {
                const labels = data.map(d => d.department);
                const totals = data.map(d => d.total);
                this.renderChart(labels, totals);
            })
            .catch(err => console.error('Chart error:', err));
    }

    renderChart(labels, data) {
        // uses Chart.js loaded via static resource
        const canvas = this.template.querySelector('#deptChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Appointments',
                    data,
                    backgroundColor: ['#0176d3','#2e7d52','#c23934','#854f0b','#4a154b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
}
