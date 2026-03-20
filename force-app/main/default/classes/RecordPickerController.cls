public with sharing class RecordPickerController {
    @AuraEnabled(cacheable=true)
    public static List<SObject> searchRecords(String searchTerm, String objectName) {
        // uses SOSL to search any object by name — works for Account, Contact, etc.
        String query = 'FIND :searchTerm IN NAME FIELDS RETURNING ' + objectName + '(Id, Name) LIMIT 10';
        List<List<SObject>> results = Search.query(query);
        return results.isEmpty() ? new List<SObject>() : results[0];
    }
}
