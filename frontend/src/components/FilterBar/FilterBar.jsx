import "./FilterBar.modules.css";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Defines a component for filtering anime cards.
 * @param {Object} selectedStatuses contains the list statuses and whether they are checked or not.
 * @param {function} onStatusChange callback for handling the updated state when selecting a status.
 * @param {string} search the search term within the searchbar.
 * @param {function} onSearchChange callback for handling the search term changing.
 * @param {number} itemsPerPage the amount of anime shown on the page.
 * @param {function} onItemsPerPageChange callback to handle changing the amount of anime shown on a page.
 * @returns {JSX.Element} a component used to change how and what anime are displayed to the user.
 */
export default function FilterBar({selectedStatuses, onStatusChange, search, onSearchChange, itemsPerPage, onItemsPerPageChange}) {
    return (
        <div className="filter-bar">
            {/* Status Checkboxes */}
            <div className="filter-group">
                {selectedStatuses.map((s) => (
                    <label key={s.status} className="filter-checkbox-label">
                        <input
                            type="checkbox"
                            checked={s.checked}
                            onChange={() => onStatusChange(s.status)}
                        />
                        {s.status}
                    </label>
                ))}
            </div>

            {/* Items Per Page Radios */}
            <div className="filter-group">
                <span className="filter-title">Items Per Page:</span>
                {PAGE_SIZE_OPTIONS.map((option) => (
                    <label key={option} className="filter-radio-label">
                        <input
                            type="radio"
                            name="itemsPerPage"
                            value={option}
                            checked={itemsPerPage === option}
                            onChange={onItemsPerPageChange}
                        />
                        {option}
                    </label>
                ))}
            </div>

            {/* Search Input */}
            <div className="filter-group">
                <label className="filter-title">
                    Search for an Anime: 
                    <input 
                        type="text" 
                        value={search} 
                        onChange={onSearchChange} 
                        data-testid="title-search-input"
                        placeholder="Type to filter..."
                    />
                </label>
            </div>
        </div>
    );
}