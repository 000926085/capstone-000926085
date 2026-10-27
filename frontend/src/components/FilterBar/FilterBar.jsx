import styles from "./FilterBar.module.css";

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
        <div className={styles['filter-bar']}>
            {/* Status Checkboxes */}
            <div className={styles['filter-group']}>
                {selectedStatuses.map((s) => (
                    <label key={s.status} className={styles['filter-checkbox-label']}>
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
            <div className={styles['filter-group']}>
                <span className={styles['filter-title']}>Items Per Page:</span>
                {PAGE_SIZE_OPTIONS.map((option) => (
                    <label key={option} className={styles['filter-radio-label']}>
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
            <div className={styles['filter-group']}>
                <label className={styles['filter-title']}>
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