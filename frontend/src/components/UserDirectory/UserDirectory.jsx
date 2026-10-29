import { useState } from 'react';
import { useUserDirectory } from '../../hooks/useUserDirectory';
import StatisticsModal from '../StatisticsModal/StatisticsModal'

import styles from './UserDirectory.module.css';

export default function UserDirectory() {
    const { users, loading, error } = useUserDirectory();
    const [selectedUser, setSelectedUser] = useState(null);

    if (!users) { return; }

    return (
        <div className={styles['container']}>
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
                        {users.map((user) => (
                            <tr key={user.user_id}>
                                <td className={styles['id-cell']}>{user.user_id}</td>
                                <td>{user.username}</td>
                                <td className={styles['stats-link']}>
                                    <span onClick={() => setSelectedUser(user)}>View</span>
                                </td>
                                <td>{new Date(user.last_updated).toLocaleString()}</td>
                                <td>{/* Actions */}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <StatisticsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    )
}