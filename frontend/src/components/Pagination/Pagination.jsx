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
            previousClassName={styles['page-item']}
            previousLinkClassName={styles['page-link']}
            nextClassName={styles['page-item']}
            nextLinkClassName={styles['page-link']}
            breakClassName={styles['page-item']}
            breakLinkClassName={styles['page-link']}
        />
    );
}