import { LightningElement, api, track } from 'lwc';

export default class SortableTable extends LightningElement {
    @api columns = [];

    // setter/getter so we reset page when new data comes in
    @api
    set data(value) {
        this._data = value ? [...value] : [];
        this.currentPage = 1;
    }
    get data() { return this._data; }

    _data = [];
    @track sortField = '';
    @track sortAsc = true;
    @track currentPage = 1;
    pageSize = 10;

    // computed — sorted + paginated data
    get pagedData() {
        const sorted = [...this._data].sort((a, b) => {
            if (!this.sortField) return 0;
            const v1 = a[this.sortField] || '';
            const v2 = b[this.sortField] || '';
            if (v1 === v2) return 0;
            return this.sortAsc ? (v1 > v2 ? 1 : -1) : (v1 < v2 ? 1 : -1);
        });
        const start = (this.currentPage - 1) * this.pageSize;
        return sorted.slice(start, start + this.pageSize);
    }

    get totalPages() {
        return Math.ceil(this._data.length / this.pageSize) || 1;
    }

    get isFirstPage() { return this.currentPage === 1; }
    get isLastPage()  { return this.currentPage >= this.totalPages; }

    handleSort(event) {
        const field = event.currentTarget.dataset.field;
        if (this.sortField === field) {
            this.sortAsc = !this.sortAsc; // toggle direction
        } else {
            this.sortField = field;
            this.sortAsc = true;
        }
    }

    prevPage() {
        if (this.currentPage > 1) this.currentPage--;
    }

    nextPage() {
        if (this.currentPage < this.totalPages) this.currentPage++;
    }
}
