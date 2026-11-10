import ReactPaginateModule from 'react-paginate';
const ReactPaginate = ReactPaginateModule.default || ReactPaginateModule;

import styles from './Pagination.module.css';

export default function Pagination({ pageCount, currentPage, onPageChange }) {
    if (pageCount <= 1) return null;

    return (
        <ReactPaginate
            breakLabel="..."
            nextLabel="Next >"
            onPageChange={onPageChange}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="< Previous"
            renderOnZeroPageCount={null}
            forcePage={currentPage}
            containerClassName={styles['pagination']}
            activeClassName={styles['active']}
            pageClassName={styles['page-item']}
            pageLinkClassName={styles['page-link']}
            previousClassName={`${styles['page-item']} ${currentPage === 0 ? styles['disabled'] : ''}`}
            previousLinkClassName={styles['page-link']}
            nextClassName={`${styles['page-item']} ${currentPage === pageCount - 1 ? styles['disabled'] : ''}`}
            nextLinkClassName={styles['page-link']}
            breakClassName={styles['page-item']}
            breakLinkClassName={styles['page-link']}
            disabledClassName={styles['disabled']}
            disabledLinkClassName={styles['disabled-link']}
        />
    );
}