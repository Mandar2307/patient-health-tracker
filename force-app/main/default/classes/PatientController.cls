public with sharing class PatientController {

    // ─── DASHBOARD STATS ───────────────────────────────────────────
    @AuraEnabled(cacheable=true)
    public static Map<String, Integer> getDashboardStats() {
        Map<String, Integer> stats = new Map<String, Integer>();
        stats.put('totalPatients',      (Integer)[SELECT COUNT() FROM Patient__c]);
        stats.put('activePatients',     (Integer)[SELECT COUNT() FROM Patient__c WHERE Status__c = 'Active']);
        stats.put('todayAppointments',  (Integer)[SELECT COUNT() FROM Appointment__c
                                                   WHERE Appointment_Date__c = TODAY AND Status__c = 'Scheduled']);
        stats.put('ongoingTreatments',  (Integer)[SELECT COUNT() FROM Treatment__c WHERE Status__c = 'Ongoing']);
        return stats;
    }

    // ─── PATIENT LIST ──────────────────────────────────────────────
    @AuraEnabled(cacheable=true)
    public static List<Patient__c> getPatients(String searchTerm) {
        if (String.isBlank(searchTerm)) {
            return [SELECT Id, Name, Date_of_Birth__c, Gender__c,
                           Phone__c, Email__c, Blood_Group__c, Status__c
                    FROM Patient__c
                    ORDER BY Name ASC
                    LIMIT 50];
        }
        String likeStr = '%' + String.escapeSingleQuotes(searchTerm) + '%';
        return [SELECT Id, Name, Date_of_Birth__c, Gender__c,
                       Phone__c, Email__c, Blood_Group__c, Status__c
                FROM Patient__c
                WHERE Name LIKE :likeStr
                ORDER BY Name ASC
                LIMIT 20];
    }

    // ─── SAVE PATIENT ──────────────────────────────────────────────
    @AuraEnabled
    public static Patient__c savePatient(Patient__c patient) {
        upsert patient;
        return patient;
    }

    // ─── GET SINGLE PATIENT WITH RELATED DATA ──────────────────────
    @AuraEnabled(cacheable=true)
    public static Patient__c getPatientDetails(Id patientId) {
        return [SELECT Id, Name, Date_of_Birth__c, Gender__c,
                       Phone__c, Email__c, Blood_Group__c,
                       Address__c, Status__c
                FROM Patient__c
                WHERE Id = :patientId
                LIMIT 1];
    }

    // ─── APPOINTMENTS ──────────────────────────────────────────────
    @AuraEnabled(cacheable=true)
    public static List<Appointment__c> getAppointments(Id patientId) {
        return [SELECT Id, Name, Appointment_Date__c, Doctor_Name__c,
                       Department__c, Status__c, Notes__c
                FROM Appointment__c
                WHERE Patient__c = :patientId
                ORDER BY Appointment_Date__c DESC];
    }

    @AuraEnabled
    public static Appointment__c saveAppointment(Appointment__c appt) {
        upsert appt;
        return appt;
    }

    // ─── TREATMENTS ────────────────────────────────────────────────
    @AuraEnabled(cacheable=true)
    public static List<Treatment__c> getTreatments(Id patientId) {
        return [SELECT Id, Name, Treatment_Name__c, Start_Date__c,
                       End_Date__c, Doctor__c, Status__c, Notes__c,
                       (SELECT Id, Medicine_Name__c, Dosage__c,
                               Frequency__c, Start_Date__c,
                               End_Date__c, Instructions__c
                        FROM Medicines__r
                        ORDER BY Medicine_Name__c)
                FROM Treatment__c
                WHERE Patient__c = :patientId
                ORDER BY Start_Date__c DESC];
    }

    @AuraEnabled
    public static Treatment__c saveTreatment(Treatment__c treatment) {
        upsert treatment;
        return treatment;
    }

    @AuraEnabled
    public static Medicine__c saveMedicine(Medicine__c medicine) {
        upsert medicine;
        return medicine;
    }

    // ─── APPOINTMENT COUNT BY DEPARTMENT (for chart) ───────────────
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getAppointmentsByDepartment() {
        List<Map<String, Object>> result = new List<Map<String, Object>>();
        AggregateResult[] grouped = [SELECT Department__c dept, COUNT(Id) total
                                     FROM Appointment__c
                                     GROUP BY Department__c];
        for (AggregateResult ar : grouped) {
            result.add(new Map<String, Object>{
                'department' => ar.get('dept'),
                'total'      => ar.get('total')
            });
        }
        return result;
    }

    // ─── DELETE PATIENT ────────────────────────────────────────────
    @AuraEnabled
    public static void deletePatient(Id patientId) {
        delete [SELECT Id FROM Patient__c WHERE Id = :patientId LIMIT 1];
    }
}
