import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import ReactPaginateModule from 'react-paginate';
const ReactPaginate = ReactPaginateModule.default || ReactPaginateModule;

import AnimeCard from '../AnimeCard/AnimeCard';

import { useRecommendations } from '../../hooks/useRecommendations';
import { filterAnime } from '../../utils/filterAnime';

import './Recommendations.modules.css'
import FilterBar from '../FilterBar';

const LIST_STATUSES = [
    { status: "PLANNING", checked: true },
    { status: "PAUSED", checked: true }
]

export default function Recommendations() {
    const { username } = useParams();
    const { anime, lastUpdated, loading, error } = useRecommendations(username);

    // State and handlers for controls.
    const [selectedStatuses, setSelectedStatuses] = useState(LIST_STATUSES);
    const handleStatusChange = (status) => {
        setSelectedStatuses(
            selectedStatuses.map((s) =>
                s.status === status
                    ? { ...s, checked: !s.checked }
                    : s
            )
        );
        setCurrentPage(0);
    };

    const [search, setSearch] = useState("");
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(0);
    };

    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(0);
    };
    
    const filteredAnime = useMemo(
        () => filterAnime(anime, selectedStatuses, search),
        [anime, selectedStatuses, search]
    );

    const pageCount = Math.ceil(filteredAnime.length / itemsPerPage);
    const itemOffset = currentPage * itemsPerPage;
    const currentItems = filteredAnime.slice(itemOffset, itemOffset + itemsPerPage);
    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };
    
    // Show a loading indicator while fetching.
    if (loading) {
        return (
            <div className="status-container">
                <h2 className="brand-name">Loading...</h2>
            </div>
        );
    }

    // If a user is unable to be found, display a form.
    if (error) {
        return (
            <form>
                <h2 className="brand-name">User Not Found</h2>
                <p className="error-subtitle">An AniList account with the username {username} does not exist.</p>
                <Link className="link" to="/">Return Home</Link>
            </form>
        )
    }

    console.log(anime);

    return (
        <div className="recommendations-container">
            <h2 style={{color: "black"}}>Recommendations for {username}</h2>
            <h3>Last Updated: {lastUpdated}</h3>

            <FilterBar
                selectedStatuses={selectedStatuses}
                onStatusChange={handleStatusChange}
                search={search}
                onSearchChange={handleSearchChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <div className="anime-list">
                {currentItems.length > 0 ? (
                    currentItems.map((a) => {
                        return (
                           <AnimeCard key={a.anime_id} anime={a} rec_length={anime.length}/>
                        );
                    })
                ) : (
                    <p>No anime found matching your criteria.</p>
                )}

                {pageCount > 1 && (
                    <ReactPaginate
                        breakLabel="..."
                        nextLabel="Next >"
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={5}
                        pageCount={pageCount}
                        previousLabel="< Previous"
                        renderOnZeroPageCount={null}
                        forcePage={currentPage}
                        containerClassName="pagination"
                        activeClassName="active"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        previousLinkClassName="page-link"
                        nextClassName="page-item"
                        nextLinkClassName="page-link"
                        breakClassName="page-item"
                        breakLinkClassName="page-link"
                    />
                )}
            </div>
        </div>
    );
}