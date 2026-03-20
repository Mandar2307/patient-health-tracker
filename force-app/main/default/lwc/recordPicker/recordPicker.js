import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/RecordPickerController.searchRecords';

export default class RecordPicker extends LightningElement {
    @api objectApiName = 'Account';  // which object to search
    @api label = 'Search Record';
    @api searchField = 'Name';       // which field to display

    @track searchResults = [];
    @track selectedRecord;
    @track showDropdown = false;
    @track inputValue = '';
    _timer;

    get noResults() {
        return this.searchResults.length === 0;
    }

    handleSearch(event) {
        this.inputValue = event.target.value;
        clearTimeout(this._timer);
        if (this.inputValue.length < 2) {
            this.showDropdown = false;
            this.searchResults = [];
            return;
        }
        this._timer = setTimeout(() => {
            searchRecords({
                searchTerm: this.inputValue,
                objectName: this.objectApiName
            })
            .then(results => {
                this.searchResults = results;
                this.showDropdown = true;
            })
            .catch(() => {
                this.searchResults = [];
            });
        }, 300);
    }

    handleSelect(event) {
        const id   = event.currentTarget.dataset.id;
        const name = event.currentTarget.dataset.name;
        this.selectedRecord = { id, name };
        this.showDropdown = false;
        this.searchResults = [];
        // tell the parent which record was picked
        this.dispatchEvent(new CustomEvent('recordselect', {
            detail: { id, name, objectApiName: this.objectApiName }
        }));
    }

    handleClear() {
        this.selectedRecord = null;
        this.inputValue = '';
        this.dispatchEvent(new CustomEvent('recordselect', { detail: null }));
    }
}
