import { useState, useEffect } from 'react';

import StatisticsModal from '../StatisticsModal/StatisticsModal'
import ImportProgress from '../ImportProgress/ImportProgress';

import { useUserDirectory } from '../../hooks/useUserDirectory';
import { useImportUser } from '../../hooks/useImportUser';

import styles from './UserDirectory.module.css';

export default function UserDirectory() {
    const { users, loading, error } = useUserDirectory();
    const [selectedUser, setSelectedUser] = useState(null);

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
    
    if (!currentUsers.length) { return; }

    return (
        <div className={styles['container']}>
            <ImportProgress
                isOpen={showModal}
                currentStepIndex={currentStepIndex}
                steps={STEPS}
                currentBatch={currentBatch}
                totalBatches={totalBatches}
                err={err}
            />

            <div className={styles['table-wrapper']}>
                <table className={styles['user-table']}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Statistics</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user) => {
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
                                        <span><a>Delete</a></span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <StatisticsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    )
}