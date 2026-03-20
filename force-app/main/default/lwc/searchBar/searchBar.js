import { LightningElement, track } from 'lwc';
import searchAccounts from '@salesforce/apex/AccountSearchController.searchAccounts';

export default class SearchBar extends LightningElement {
    @track results = [];
    @track error;
    @track isLoading = false;
    @track searchTerm = '';
    _debounceTimer;

    get hasResults() {
        return this.results && this.results.length > 0;
    }

    handleInput(event) {
        this.searchTerm = event.target.value;
        // clear previous timer — restart countdown
        clearTimeout(this._debounceTimer);
        if (this.searchTerm.length < 2) {
            this.results = [];
            return;
        }
        // wait 300ms after user stops typing — then search
        this._debounceTimer = setTimeout(() => {
            this.runSearch();
        }, 300);
    }

    runSearch() {
        this.isLoading = true;
        searchAccounts({ searchTerm: this.searchTerm })
            .then(data => {
                this.results = data;
                this.error = undefined;
            })
            .catch(err => {
                this.error = err.body.message;
                this.results = [];
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedRecord = this.results.find(r => r.Id === selectedId);
        // fire event to parent with selected record
        this.dispatchEvent(new CustomEvent('accountselected', {
            detail: { id: selectedId, name: selectedRecord.Name }
        }));
        this.results = [];
        this.searchTerm = selectedRecord.Name;
    }
}
