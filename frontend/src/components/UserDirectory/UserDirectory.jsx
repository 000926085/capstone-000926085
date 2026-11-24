import { useState, useEffect, useMemo } from 'react';

import StatisticsModal from '../StatisticsModal/StatisticsModal'
import ImportProgress from '../ImportProgress/ImportProgress';
import Pagination from '../Pagination/Pagination';

import { useUserDirectory } from '../../hooks/useUserDirectory';
import { useImportUser } from '../../hooks/useImportUser';
import { deleteUser } from '../../utils/deleteUser';

import styles from './UserDirectory.module.css';

export default function UserDirectory() {
    const { users, loading, error } = useUserDirectory();
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortDirection, setSortDirection] = useState(null);

    const [currentUsers, setCurrentUsers] = useState([]);
    useEffect(() => {
        if (users) {
            setCurrentUsers(users);
        }
    }, [users]);

    const {
        importUser,
        showModal,
        currentStepIndex,
        STEPS,
        currentBatch,
        totalBatches,
        err
    } = useImportUser();

    const refreshUser = async (user) => {
        await importUser(user.username, () => {
            setCurrentUsers(prevUsers => 
                prevUsers.map(u => 
                    u.user_id === user.user_id 
                        ? { ...u, last_updated: new Date().toISOString() } 
                        : u
                )
            );
        }, true);
    };

    const timeDifference = (last_updated) => {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const elapsed = new Date() - new Date(last_updated);

        if (elapsed < msPerMinute) { return 'Just now'; }
        else if (elapsed < msPerHour) { 
            const mins = Math.round(elapsed / msPerMinute);
            return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`; 
        } else if (elapsed < msPerDay) {
            const hours = Math.round(elapsed / msPerHour);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            const days = Math.round(elapsed / msPerDay);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
    };

    const handleSortByLastUpdated = () => {
        setSortDirection((prev) => {
            if (prev === null) return 'desc'; 
            if (prev === 'desc') return 'asc'; 
            return null; 
        });
    };

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return currentUsers;

        return currentUsers.filter((user) =>
            (user.username ?? '').toLowerCase().includes(query)
        );
    }, [currentUsers, searchTerm]);
    
    const sortedUsers = useMemo(() => {
        if (!sortDirection) return filteredUsers;

        return [...filteredUsers].sort((a, b) => {
            const timeA = a.last_updated ? new Date(a.last_updated).getTime() : 0;
            const timeB = b.last_updated ? new Date(b.last_updated).getTime() : 0;
            return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
        });
    }, [filteredUsers, sortDirection]);

    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, sortDirection]);

    const pageCount = Math.ceil(sortedUsers.length / itemsPerPage);
    const itemOffset = currentPage * itemsPerPage;
    const currentItems = sortedUsers.slice(itemOffset, itemOffset + itemsPerPage);
    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteUser = async (user) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${user.username}" and all their imported data?`
        );
        if (!confirmed) return;

        try {
            await deleteUser(user.username);
            setCurrentUsers((prevUsers) =>
                prevUsers.filter((u) => u.user_id !== user.user_id)
            );
        } catch (err) {
            console.error(err);
        }
    };

    if (!currentUsers.length) { return; }

    const sortSymbol =
        sortDirection === 'asc' ? '▲' : sortDirection === 'desc' ? '▼' : '⇅';

    return (
        <div className={styles['container']}>
            <input
                className='shared-text-input'
                type="text"
                id="username_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a user..."
            />
            <h2 className='subtitle'>
                Showing {currentItems.length} of {filteredUsers.length} users
                {searchTerm.trim() ? ` (filtered from ${currentUsers.length})` : ''}
            </h2>

            <ImportProgress
                isOpen={showModal}
                currentStepIndex={currentStepIndex}
                steps={STEPS}
                currentBatch={currentBatch}
                totalBatches={totalBatches}
                err={err}
            />

            {currentItems.length > 0 ? (
                <div className={styles['table-wrapper']}>
                    <table className={styles['user-table']}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Statistics</th>
                                <th
                                    onClick={handleSortByLastUpdated}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    title={
                                        sortDirection === null
                                            ? 'Sorted by ID (click to sort by Last Updated)'
                                            : `Sorted by Last Updated (${sortDirection})`
                                    }
                                >
                                    Last Updated {sortSymbol}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((user) => {
                                const isOutdated = timeDifference(user.last_updated).includes('day');

                                return (
                                    <tr key={user.user_id}>
                                        <td className={styles['id-cell']} data-label="ID">{user.user_id}</td>
                                        <td data-label="Username">{user.username}</td>
                                        <td className={styles['stats-link']} data-label="Statistics">
                                            <span onClick={() => setSelectedUser(user)}>View</span>
                                        </td>
                                        <td data-label="Last Updated" className={isOutdated ? styles['ood'] : ''}>
                                            <span>{new Date(user.last_updated).toLocaleString()}</span>
                                            <span className={styles['timestamp-subtitle']}>
                                                {timeDifference(user.last_updated)}
                                            </span>
                                        </td>
                                        <td data-label="Actions" className={styles['stats-link']}>
                                            <span onClick={() => refreshUser(user)}><a>Refresh</a></span>
                                            <span onClick={() => handleDeleteUser(user)}><a>Delete</a></span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <Pagination
                        pageCount={pageCount}
                        currentPage={currentPage}
                        onPageChange={handlePageClick}
                    />
                </div>
            ) : (
                <p>No users found matching "{searchTerm.trim()}".</p>
            )}

            <StatisticsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    )
}