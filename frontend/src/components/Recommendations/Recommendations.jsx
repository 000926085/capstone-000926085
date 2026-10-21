import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import AnimeCard from '../AnimeCard/AnimeCard';
import FilterBar from '../FilterBar/FilterBar';
import Pagination from '../Pagination/Pagination';

import { useRecommendations } from '../../hooks/useRecommendations';
import { filterAnime } from '../../utils/filterAnime';

import './Recommendations.modules.css'

const LIST_STATUSES = [
    { status: "PLANNING", checked: true },
    { status: "PAUSED", checked: true }
]

export default function Recommendations() {
    const { username } = useParams();
    const { anime, lastUpdated, pfp, loading, error } = useRecommendations(username);

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

    return (
        <div className="recommendations-container">
            <div className="user-container">
            <img className="userpfp" src={pfp} alt={username} />
                <div className="user-info">
                    <h2 style={{color: "black"}}>Recommendations for {username}</h2>
                    <h3>Last Updated: {lastUpdated}</h3>
                </div>
            </div>

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
                    <form>
                        <h2 className="brand-name">No Anime Found</h2>
                        <p className="error-subtitle">There are no anime within this anime list that match your criteria.</p>
                    </form>
                )}

               <Pagination
                    pageCount={pageCount}
                    currentPage={currentPage}
                    onPageChange={handlePageClick}
                />
            </div>
        </div>
    );
}