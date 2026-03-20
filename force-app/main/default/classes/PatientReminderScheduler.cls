// Runs every day at 8 AM and sends reminder emails
// to patients who have appointments scheduled for TOMORROW
// Schedule: System.schedule('Daily Appointment Reminders', '0 0 8 * * ?', new PatientReminderScheduler());

public class PatientReminderScheduler implements Schedulable {

    public void execute(SchedulableContext ctx) {
        // get all appointments scheduled for tomorrow
        Date tomorrow = Date.today().addDays(1);
        List<Appointment__c> upcomingAppointments = [
            SELECT Id, Name, Appointment_Date__c,
                   Doctor_Name__c, Department__c,
                   Patient__r.Name, Patient__r.Email__c,
                   Patient__r.Phone__c
            FROM Appointment__c
            WHERE DAY_ONLY(Appointment_Date__c) = :tomorrow
            AND   Status__c = 'Scheduled'
            AND   Patient__r.Email__c != null
        ];

        if (upcomingAppointments.isEmpty()) {
            System.debug('No appointments tomorrow — no reminders sent.');
            return;
        }

        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();

        for (Appointment__c appt : upcomingAppointments) {
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(new List<String>{ appt.Patient__r.Email__c });
            mail.setSubject('Appointment Reminder — ' + appt.Patient__r.Name);
            mail.setHtmlBody(buildEmailBody(appt));
            emails.add(mail);
        }

        try {
            Messaging.sendEmail(emails);
            System.debug('Sent ' + emails.size() + ' reminder emails.');
        } catch (Exception e) {
            System.debug('Email sending failed: ' + e.getMessage());
        }
    }

    // builds the HTML email body
    private String buildEmailBody(Appointment__c appt) {
        String apptDate = appt.Appointment_Date__c != null
            ? String.valueOf(appt.Appointment_Date__c) : 'Tomorrow';

        return '<html><body style="font-family:Arial,sans-serif;">'
             + '<h2 style="color:#0176d3;">Appointment Reminder</h2>'
             + '<p>Dear <strong>' + appt.Patient__r.Name + '</strong>,</p>'
             + '<p>This is a friendly reminder about your upcoming appointment:</p>'
             + '<table style="border-collapse:collapse;width:400px;">'
             + '<tr><td style="padding:8px;background:#f3f3f3;font-weight:bold;">Date</td>'
             + '<td style="padding:8px;">' + apptDate + '</td></tr>'
             + '<tr><td style="padding:8px;background:#f3f3f3;font-weight:bold;">Doctor</td>'
             + '<td style="padding:8px;">' + appt.Doctor_Name__c + '</td></tr>'
             + '<tr><td style="padding:8px;background:#f3f3f3;font-weight:bold;">Department</td>'
             + '<td style="padding:8px;">' + appt.Department__c + '</td></tr>'
             + '</table>'
             + '<p style="margin-top:1rem;">Please arrive 10 minutes early.</p>'
             + '<p style="color:#747474;font-size:12px;">This is an automated reminder. '
             + 'Please do not reply to this email.</p>'
             + '</body></html>';
    }
}
