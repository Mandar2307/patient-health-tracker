public with sharing class PatientReportController {

    public Patient__c patient            { get; set; }
    public List<Appointment__c> appointments { get; set; }
    public List<Treatment__c>  treatments   { get; set; }
    public String reportDate             { get; set; }

    // constructor — called when VF page loads
    public PatientReportController() {
        String patientId = ApexPages.currentPage().getParameters().get('id');
        reportDate = String.valueOf(Date.today());

        if (String.isBlank(patientId)) {
            patient      = new Patient__c();
            appointments = new List<Appointment__c>();
            treatments   = new List<Treatment__c>();
            return;
        }

        // get patient details
        patient = [SELECT Id, Name, Date_of_Birth__c, Gender__c,
                          Phone__c, Email__c, Blood_Group__c,
                          Address__c, Status__c
                   FROM Patient__c
                   WHERE Id = :patientId
                   LIMIT 1];

        // get all appointments
        appointments = [SELECT Id, Appointment_Date__c, Doctor_Name__c,
                               Department__c, Status__c, Notes__c
                        FROM Appointment__c
                        WHERE Patient__c = :patientId
                        ORDER BY Appointment_Date__c DESC];

        // get all treatments WITH medicines
        treatments = [SELECT Id, Treatment_Name__c, Start_Date__c,
                             End_Date__c, Doctor__c, Status__c, Notes__c,
                             (SELECT Medicine_Name__c, Dosage__c,
                                     Frequency__c, Instructions__c
                              FROM Medicines__r
                              ORDER BY Medicine_Name__c)
                     FROM Treatment__c
                     WHERE Patient__c = :patientId
                     ORDER BY Start_Date__c DESC];
    }

    // helper — current ongoing treatments only
    public List<Treatment__c> getOngoingTreatments() {
        List<Treatment__c> ongoing = new List<Treatment__c>();
        for (Treatment__c t : treatments) {
            if (t.Status__c == 'Ongoing') ongoing.add(t);
        }
        return ongoing;
    }
}
