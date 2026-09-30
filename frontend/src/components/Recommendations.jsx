import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPaginateModule from 'react-paginate';
const ReactPaginate = ReactPaginateModule.default || ReactPaginateModule;
import '../css/Recommendations.css'

const LIST_STATUSES = [
    { status: "PLANNING", checked: true },
    { status: "PAUSED", checked: true }
]
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function Recommendations() {
    const { username } = useParams();
    const [anime, setAnime] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [selectedStatuses, setSelectedStatuses] = useState(LIST_STATUSES);
    const handleOnChange = (status) => {
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

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(0);
    };

    useEffect(() => {
        let mounted = true;

        const checkUser = async () => {
            setLoading(true);

            try {
                const res = await fetch(`http://localhost:8000/api/fetch-planning-data/${username}`);
                if (!res.ok) { throw new Error ("User not found."); }
                const data = await res.json();

                console.log(data);


                if (mounted) { 
                    setAnime(data["planning_anime"] || []); 
                    setLastUpdated(data["last_updated"] || null);
                }
            } catch (err) {
                console.error(err);
                if (mounted) { setError(true); }
            } finally {
                if (mounted) { setLoading(false); }
            }
        }

        checkUser();
        return () => { mounted = false; }
    }, [username]);

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

    const filteredAnime = (anime || []).filter((a) => {
        const matchesStatus = selectedStatuses.some(
            (s) => s.status === a.list_status && s.checked
        );

        const titleText = (a.title?.romaji || a.title?.english || "");
        const query = search.toLowerCase().trim();
        const matchesSearch = query === "" || titleText.toLowerCase().includes(query);

        return matchesStatus && matchesSearch;
    });

    const pageCount = Math.ceil(filteredAnime.length / itemsPerPage);
    const itemOffset = currentPage * itemsPerPage;
    const currentItems = filteredAnime.slice(itemOffset, itemOffset + itemsPerPage);
    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    return (
        <div className="recommendations-container">
            <h2 style={{color: "black"}}>Recommendations for {username}</h2>
            <h3>Last Updated: {lastUpdated}</h3>

            {selectedStatuses.map((s) => (
                <label key={s.status}>
                    <input
                        type="checkbox"
                        checked={s.checked}
                        onChange={() => handleOnChange(s.status)}
                    />
                    {s.status}
                </label>
            ))}

            <div style={{ margin: '15px 0' }}>
                <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Items Per Page:</span>
                {PAGE_SIZE_OPTIONS.map((option) => (
                    <label key={option} style={{ marginRight: '15px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="itemsPerPage"
                            value={option}
                            checked={itemsPerPage === option}
                            onChange={handleItemsPerPageChange}
                        />
                        {option}
                    </label>
                ))}
            </div>

            <div>
                <label>
                    Search for an Anime: 
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="title-search-input"/>
                </label>
            </div>

            <div className="anime-list">
                {currentItems.length > 0 ? (
                    currentItems.map((a, index) => {
                        const title = (a.title?.romaji || a.title?.english || "");

                        return (
                            <div className="anime_card" key={a.anime_id || index} data-testid="anime-card"> 
                                <p data-testid="anime-card-title">{title}</p> 
                                <p>List Status: {a.list_status}</p>
                                <p>Anime Status: {a.status}</p>
                                <p>Mean Score: {a.mean_score}</p>
                                <p>Start Date: {a.start_date}</p>
                                <img src={a.cover} alt={title} /> 
                            </div> 
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