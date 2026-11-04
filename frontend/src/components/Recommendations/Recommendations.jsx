import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';

import AnimeCard from '../AnimeCard/AnimeCard';
import FilterBar from '../FilterBar/FilterBar';
import Pagination from '../Pagination/Pagination';
import UserHeader from '../UserHeader/UserHeader';
import ImportProgress from '../ImportProgress/ImportProgress';

import { useRecommendations } from '../../hooks/useRecommendations';
import { useRecommendationsMultiple } from '../../hooks/useRecommendationsMultiple';
import { filterAnime } from '../../utils/filterAnime';
import { useImportUser } from '../../hooks/useImportUser';

import styles from './Recommendations.module.css'

const LIST_STATUSES = [
    { status: "PLANNING", checked: true },
    { status: "PAUSED", checked: true }
]

export default function Recommendations() {
    const { username: primaryUser } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const additionalUsersParam = searchParams.get('users');
    const additionalUsers = additionalUsersParam ? additionalUsersParam.split(',').filter(Boolean) : [];
    const allUsers = useMemo(() => [primaryUser, ...additionalUsers], [primaryUser, additionalUsers]);
    const {
        importUser,
        showModal,
        currentStepIndex,
        STEPS,
        currentBatch,
        totalBatches,
        err
    } = useImportUser();

    const handleUsersChange = async (newUsers) => {
        if (newUsers.length === 0) return;
        const addedUser = newUsers.find(u => !allUsers.includes(u));
        if (addedUser) {
            const success = await importUser(addedUser);
            if (!success) { return; }
        }

        const [newPrimary, ...rest] = newUsers;
        if (newPrimary !== primaryUser) {
            const newSearch = rest.length > 0 ? `?users=${rest.join(',')}` : '';
            navigate(`/recommendations/${newPrimary}${newSearch}`);
        } else {
            setSearchParams(rest.length > 0 ? { users: rest.join(',') } : {});
        }
        setCurrentPage(0);
    };

    const { username } = useParams();
    const { anime, lastUpdated, group_users, loading, error } = useRecommendationsMultiple(allUsers);

    // Filters anime by the list statuses selected.
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

    // Search term for filtering anime.
    const [search, setSearch] = useState("");
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(0);
    };
    const filteredAnime = useMemo(
        () => filterAnime(anime, selectedStatuses, search),
        [anime, selectedStatuses, search]
    );

    // Pagination, used for tracking current page and how many anime to show on each page.
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(0);
    };

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
            <div className={styles['status-container']}>
                <h2 className={styles['brand-name']}>Loading...</h2>
            </div>
        );
    }

    // If a user is unable to be found, display a form.
    if (error) {
        return (
            <form>
                <h2 className={styles['brand-name']}>User Not Found</h2>
                <p className={styles['error-subtitle']}>An AniList account with the username {username} does not exist.</p>
                <Link className={styles['link']} to="/">Return Home</Link>
            </form>
        )
    }

    return (
        <div className={styles['recommendations-container']}>
            <UserHeader 
                initialUsers={allUsers} 
                onUsersChange={handleUsersChange} 
                group_users={group_users}
                lastUpdated={lastUpdated} 
            />

            <ImportProgress
                isOpen={showModal}
                currentStepIndex={currentStepIndex}
                steps={STEPS}
                currentBatch={currentBatch}
                totalBatches={totalBatches}
                err={err}
            />

            <FilterBar
                selectedStatuses={selectedStatuses}
                onStatusChange={handleStatusChange}
                search={search}
                onSearchChange={handleSearchChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <div className={styles['anime-list']}>
                {currentItems.length > 0 ? (
                    currentItems.map((a) => {
                        return (
                           <AnimeCard key={a.anime_id} anime={a} rec_length={anime.length}/>
                        );
                    })
                ) : (
                    <form>
                        <h2 className='brand-name'>No Anime Found</h2>
                        <p className='error-subtitle'>There are no anime within this anime list that match your criteria.</p>
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