public with sharing class AccountSearchController {
    @AuraEnabled(cacheable=true)
    public static List<Account> searchAccounts(String searchTerm) {
        String likeStr = '%' + String.escapeSingleQuotes(searchTerm) + '%';
        return [
            SELECT Id, Name, Industry, Phone
            FROM Account
            WHERE Name LIKE :likeStr
            ORDER BY Name ASC
            LIMIT 10
        ];
    }
}
